<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Models\Task;
use App\Services\Push;
use Illuminate\Http\Request;

class PushController extends Controller
{
    public function key()
    {
        return ['publicKey' => Push::keys()['publicKey']];
    }

    public function subscribe(Request $request)
    {
        $data = $request->validate([
            'endpoint' => 'required|url|max:700',
            'keys.p256dh' => 'required|string|max:255',
            'keys.auth' => 'required|string|max:255',
        ]);
        PushSubscription::updateOrCreate(['endpoint' => $data['endpoint']], [
            'p256dh' => $data['keys']['p256dh'],
            'auth' => $data['keys']['auth'],
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return ['ok' => true, 'devices' => PushSubscription::count()];
    }

    public function unsubscribe(Request $request)
    {
        PushSubscription::where('endpoint', (string) $request->input('endpoint'))->delete();

        return ['ok' => true];
    }

    public function test()
    {
        $sent = Push::send([
            'title' => '🔔 Тестове нагадування',
            'body' => 'Сповіщення працюють. Так виглядатимуть нагадування про справи.',
            'tag' => 'test',
            'url' => '/',
        ]);

        return ['sent' => $sent];
    }

    /** Дії з кнопок сповіщення (підписані посилання, без сесії). */
    public function taskDone(Task $task)
    {
        $task->update(['done' => true]);

        return response()->noContent();
    }

    public function taskSnooze(Task $task, int $minutes)
    {
        $task->snooze(max(1, min($minutes, 1440)));

        return response()->noContent();
    }
}
