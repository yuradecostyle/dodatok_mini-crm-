<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $guarded = ['id', 'created_at', 'updated_at', 'remind_at', 'notified_at', 'done_at'];

    protected $hidden = ['notified_at'];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'done' => 'boolean',
            'done_at' => 'datetime',
            'remind_at' => 'datetime:Y-m-d\TH:i',
            'notified_at' => 'datetime',
            'remind_minutes' => 'integer',
            'project_id' => 'integer',
            'position' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Task $task) {
            if ($task->isDirty('done')) {
                $task->done_at = $task->done ? now() : null;
            }
            if ($task->isDirty(['date', 'time', 'remind_minutes'])) {
                $task->remind_at = $task->computeRemindAt();
                $task->notified_at = null;
            }
        });
    }

    public function computeRemindAt(): ?Carbon
    {
        if ($this->remind_minutes === null || ! $this->date) {
            return null;
        }
        $at = Carbon::parse($this->date->format('Y-m-d').' '.($this->time ?: '09:00'));

        return $at->subMinutes((int) $this->remind_minutes);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** Відкласти нагадування на N хвилин від зараз. */
    public function snooze(int $minutes): void
    {
        $this->remind_at = now()->addMinutes($minutes);
        $this->notified_at = null;
        $this->saveQuietly();
    }
}
