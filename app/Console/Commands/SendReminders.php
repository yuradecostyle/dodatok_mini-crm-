<?php

namespace App\Console\Commands;

use App\Models\Lead;
use App\Models\Settlement;
use App\Models\Task;
use App\Models\Utility;
use App\Services\Push;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\URL;

class SendReminders extends Command
{
    protected $signature = 'reminders:send';

    protected $description = 'Надіслати push-нагадування, час яких настав';

    private const MORNING = '09:00';

    public function handle(): int
    {
        $now = now();
        $sent = 0;

        // 1. Завдання з нагадуванням
        $tasks = Task::query()
            ->where('done', false)
            ->whereNotNull('remind_at')
            ->whereNull('notified_at')
            ->where('remind_at', '<=', $now)
            ->where('remind_at', '>=', $now->copy()->subHours(12))
            ->get();
        foreach ($tasks as $task) {
            $project = $task->project_id ? optional($task->project()->first())->name : null;
            $body = trim(($task->time ? 'О '.$task->time.' · ' : '').($project ? $project.' · ' : '').($task->note ?? ''), ' ·');
            $expires = now()->addDays(3);
            $sent += Push::send([
                'title' => '🔔 '.$task->title,
                'body' => $body ?: 'Час виконати справу',
                'tag' => 'task-'.$task->id,
                'url' => '/?tab=planner&task='.$task->id,
                'actions' => [
                    ['action' => 'done', 'title' => '✓ Виконано', 'url' => URL::temporarySignedRoute('push.task.done', $expires, ['task' => $task->id])],
                    ['action' => 'snooze', 'title' => '⏰ +15 хв', 'url' => URL::temporarySignedRoute('push.task.snooze', $expires, ['task' => $task->id, 'minutes' => 15])],
                ],
            ]) > 0 ? 1 : 0;
            $task->notified_at = $now;
            $task->saveQuietly();
        }

        // Ранкові нагадування (ліди, розрахунки, комуналка) — від 09:00
        if ($now->format('H:i') >= self::MORNING) {
            $today = $now->toDateString();

            Lead::whereDate('next_date', '<=', $today)
                ->whereIn('status', ['new', 'work', 'offer'])
                ->where(fn ($q) => $q->whereNull('notified_on')->orWhereDate('notified_on', '<', $today))
                ->get()->each(function (Lead $lead) use ($today, &$sent) {
                    $sent += Push::send([
                        'title' => '🎯 Звʼязатися: '.$lead->name,
                        'body' => $lead->request ?: 'Запланований контакт з лідом',
                        'tag' => 'lead-'.$lead->id,
                        'url' => '/?tab=leads&lead='.$lead->id,
                    ]) > 0 ? 1 : 0;
                    $lead->notified_on = $today;
                    $lead->saveQuietly();
                });

            Settlement::whereDate('due_date', '<=', $today)->where('closed', false)
                ->where(fn ($q) => $q->whereNull('notified_on')->orWhereDate('notified_on', '<', $today))
                ->get()->each(function (Settlement $s) use ($today, &$sent) {
                    $paid = (float) $s->payments()->sum('amount');
                    if ($paid + 0.009 >= $s->amount) {
                        return;
                    }
                    $left = number_format($s->amount - $paid, 0, ',', ' ');
                    $sent += Push::send([
                        'title' => ($s->direction === 'payable' ? '💸 Оплатити: ' : '💰 Отримати від: ').$s->counterparty,
                        'body' => $s->title.' · залишок '.$left.' ₴',
                        'tag' => 'settlement-'.$s->id,
                        'url' => '/?tab=finance&sub=settlements',
                    ]) > 0 ? 1 : 0;
                    $s->notified_on = $today;
                    $s->saveQuietly();
                });

            Utility::whereDate('due_date', '<=', $today)->where('paid', false)
                ->where(fn ($q) => $q->whereNull('notified_on')->orWhereDate('notified_on', '<', $today))
                ->get()->each(function (Utility $u) use ($today, &$sent) {
                    $sent += Push::send([
                        'title' => '🏠 Сплатити: '.$u->service,
                        'body' => 'За '.$u->period.' · '.number_format($u->amount, 2, ',', ' ').' ₴',
                        'tag' => 'utility-'.$u->id,
                        'url' => '/?tab=finance&sub=utilities',
                    ]) > 0 ? 1 : 0;
                    $u->notified_on = $today;
                    $u->saveQuietly();
                });
        }

        if ($sent) {
            $this->info("Надіслано нагадувань: $sent");
        }

        return self::SUCCESS;
    }
}
