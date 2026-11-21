<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\VAPID;
use Minishlink\WebPush\WebPush;

class Push
{
    /** VAPID-ключі генеруються один раз і зберігаються в базі. */
    public static function keys(): array
    {
        $public = Setting::get('vapid_public');
        $private = Setting::get('vapid_private');
        if (! $public || ! $private) {
            $k = VAPID::createVapidKeys();
            Setting::put('vapid_public', $public = $k['publicKey']);
            Setting::put('vapid_private', $private = $k['privateKey']);
        }

        return ['publicKey' => $public, 'privateKey' => $private];
    }

    /**
     * Надіслати сповіщення на всі підписані пристрої.
     * @return int кількість успішних доставок
     */
    public static function send(array $payload): int
    {
        // Попередження бібліотеки про відсутність GMP/BCMath не повинно зупиняти доставку
        set_error_handler(fn ($no, $msg) => str_contains($msg, 'GMP or BCMath'), E_ALL);
        try {
            return self::deliver($payload);
        } finally {
            restore_error_handler();
        }
    }

    private static function deliver(array $payload): int
    {
        $subs = PushSubscription::all();
        if ($subs->isEmpty()) {
            return 0;
        }
        $keys = self::keys();
        $push = new WebPush([
            'VAPID' => [
                'subject' => config('app.url') ?: 'mailto:owner@example.com',
                'publicKey' => $keys['publicKey'],
                'privateKey' => $keys['privateKey'],
            ],
        ], ['TTL' => 3600 * 12, 'urgency' => 'high']);
        $push->setReuseVAPIDHeaders(true);

        foreach ($subs as $s) {
            $push->queueNotification(Subscription::create([
                'endpoint' => $s->endpoint,
                'publicKey' => $s->p256dh,
                'authToken' => $s->auth,
                'contentEncoding' => 'aes128gcm',
            ]), json_encode($payload, JSON_UNESCAPED_UNICODE));
        }

        $ok = 0;
        $reports = iterator_to_array($push->flush());
        foreach ($reports as $report) {
            if ($report->isSuccess()) {
                $ok++;
            } elseif ($report->isSubscriptionExpired()) {
                PushSubscription::where('endpoint', $report->getEndpoint())->delete();
            } else {
                Log::warning('push failed: '.$report->getReason());
            }
        }

        return $ok;
    }
}
