<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class EnsureOwner extends Command
{
    protected $signature = 'owner:ensure';

    protected $description = 'Створити обліковий запис власника з OWNER_EMAIL / OWNER_PASSWORD, якщо його ще немає';

    public function handle(): int
    {
        if (User::query()->exists()) {
            $this->line('Власник уже існує.');

            return self::SUCCESS;
        }
        $email = env('OWNER_EMAIL');
        $password = env('OWNER_PASSWORD');
        if (! $email || ! $password || strlen($password) < 10) {
            $this->error('Задайте OWNER_EMAIL і OWNER_PASSWORD (мінімум 10 символів).');

            return self::FAILURE;
        }
        User::create(['name' => 'Власник', 'email' => $email, 'password' => $password]);
        $this->info("Створено власника $email");

        return self::SUCCESS;
    }
}
