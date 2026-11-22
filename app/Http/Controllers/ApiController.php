<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Project;
use App\Models\Settlement;
use App\Models\Source;
use App\Models\Task;
use App\Models\Transaction;
use App\Models\Utility;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ApiController extends Controller
{
    /** Ресурси, доступні через універсальний CRUD. */
    private function resources(): array
    {
        $date = 'nullable|date_format:Y-m-d';

        return [
            'leads' => [Lead::class, [
                'name' => 'required|string|max:255',
                'contact' => 'nullable|string|max:255',
                'request' => 'nullable|string|max:5000',
                'source_id' => 'nullable|integer|exists:sources,id',
                'status' => ['required', Rule::in(Lead::STATUSES)],
                'amount' => 'nullable|numeric|min:0',
                'date' => 'required|date_format:Y-m-d',
                'next_date' => $date,
                'note' => 'nullable|string|max:5000',
            ]],
            'sources' => [Source::class, [
                'name' => 'required|string|max:60',
                'channel' => ['required', Rule::in(Source::CHANNELS)],
                'position' => 'nullable|integer',
            ]],
            'projects' => [Project::class, [
                'name' => 'required|string|max:255',
                'color' => 'nullable|string|max:20',
                'emoji' => 'nullable|string|max:16',
                'description' => 'nullable|string|max:5000',
                'status' => ['required', Rule::in(['active', 'paused', 'done'])],
                'due_date' => $date,
                'lead_id' => 'nullable|integer|exists:leads,id',
            ]],
            'tasks' => [Task::class, [
                'project_id' => 'nullable|integer|exists:projects,id',
                'title' => 'required|string|max:255',
                'note' => 'nullable|string|max:5000',
                'date' => $date,
                'time' => ['nullable', 'regex:/^\d{2}:\d{2}$/'],
                'priority' => ['required', Rule::in(['low', 'mid', 'high'])],
                'done' => 'boolean',
                'remind_minutes' => 'nullable|integer|min:0|max:10080',
                'position' => 'nullable|integer',
            ]],
            'settlements' => [Settlement::class, [
                'direction' => ['required', Rule::in(['payable', 'receivable'])],
                'counterparty' => 'required|string|max:255',
                'title' => 'required|string|max:255',
                'amount' => 'required|numeric|min:0',
                'date' => $date,
                'due_date' => $date,
                'closed' => 'boolean',
                'note' => 'nullable|string|max:5000',
            ]],
            'utilities' => [Utility::class, [
                'service' => 'required|string|max:60',
                'period' => ['required', 'regex:/^\d{4}-\d{2}$/'],
                'meter_prev' => 'nullable|numeric',
                'meter_curr' => 'nullable|numeric',
                'tariff' => 'nullable|numeric|min:0',
                'amount' => 'required|numeric|min:0',
                'due_date' => $date,
                'paid' => 'boolean',
                'paid_date' => $date,
                'note' => 'nullable|string|max:5000',
            ]],
            'transactions' => [Transaction::class, [
                'type' => ['required', Rule::in(['income', 'expense'])],
                'scope' => ['nullable', Rule::in(Transaction::SCOPES)],
                'kind' => ['required', Rule::in(Transaction::KINDS)],
                'category' => 'required|string|max:60',
                'amount' => 'required|numeric|gt:0',
                'date' => 'required|date_format:Y-m-d',
                'counterparty' => 'nullable|string|max:255',
                'note' => 'nullable|string|max:5000',
                'settlement_id' => 'nullable|integer|exists:settlements,id',
                'project_id' => 'nullable|integer|exists:projects,id',
            ]],
        ];
    }

    private function resolve(string $resource): array
    {
        $map = $this->resources();
        abort_unless(isset($map[$resource]), 404);

        return $map[$resource];
    }

    /** Усі дані одним запитом — застосунок особистий, обсяги невеликі. */
    public function state()
    {
        return [
            'sources' => Source::orderBy('position')->orderBy('id')->get(),
            'leads' => Lead::orderByDesc('date')->orderByDesc('id')->get(),
            'projects' => Project::orderBy('status')->orderByDesc('id')->get(),
            'tasks' => Task::orderBy('position')->orderBy('id')->get(),
            'settlements' => Settlement::orderByDesc('id')->get(),
            'utilities' => Utility::orderByDesc('period')->orderBy('service')->get(),
            'transactions' => Transaction::orderByDesc('date')->orderByDesc('id')->get(),
        ];
    }

    public function store(Request $request, string $resource)
    {
        [$class, $rules] = $this->resolve($resource);
        $item = $class::create($request->validate($rules));

        return response()->json($item->fresh(), 201);
    }

    public function update(Request $request, string $resource, int $id)
    {
        [$class, $rules] = $this->resolve($resource);
        $partial = array_map(fn ($r) => array_merge(['sometimes'], is_array($r) ? $r : explode('|', $r)), $rules);
        $item = $class::findOrFail($id);
        $item->update($request->validate($partial));

        return $item->fresh();
    }

    public function destroy(string $resource, int $id)
    {
        [$class] = $this->resolve($resource);
        $class::findOrFail($id)->delete();

        return ['ok' => true];
    }

    /** Швидке створення списку завдань: кожен рядок — окреме завдання. */
    public function bulkTasks(Request $request)
    {
        $data = $request->validate([
            'lines' => 'required|array|min:1|max:200',
            'lines.*' => 'string|max:255',
            'project_id' => 'nullable|integer|exists:projects,id',
            'date' => 'nullable|date_format:Y-m-d',
        ]);
        $pos = (int) Task::max('position');
        $created = [];
        foreach ($data['lines'] as $line) {
            $title = trim(preg_replace('/^[-*•\d.)\s\[\]]+/u', '', $line));
            if ($title === '') {
                continue;
            }
            $created[] = Task::create([
                'title' => $title,
                'project_id' => $data['project_id'] ?? null,
                'date' => $data['date'] ?? null,
                'priority' => 'low',
                'position' => ++$pos,
            ])->fresh();
        }

        return response()->json($created, 201);
    }

    public function export()
    {
        return response()->json($this->state() + ['exported_at' => now()->toIso8601String()])
            ->header('Content-Disposition', 'attachment; filename="minicrm-'.now()->format('Y-m-d').'.json"');
    }
}
