<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('contact')->nullable();
            $t->text('request')->nullable();
            $t->string('source', 40);
            $t->string('status', 20)->default('new');
            $t->decimal('amount', 14, 2)->nullable();
            $t->date('date');
            $t->date('next_date')->nullable();
            $t->text('note')->nullable();
            $t->date('notified_on')->nullable();
            $t->timestamps();
        });

        Schema::create('projects', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('color', 20)->default('#6d5efc');
            $t->string('emoji', 16)->nullable();
            $t->text('description')->nullable();
            $t->string('status', 20)->default('active');
            $t->date('due_date')->nullable();
            $t->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('tasks', function (Blueprint $t) {
            $t->id();
            $t->foreignId('project_id')->nullable()->constrained()->cascadeOnDelete();
            $t->string('title');
            $t->text('note')->nullable();
            $t->date('date')->nullable();
            $t->string('time', 5)->nullable();
            $t->string('priority', 10)->default('low');
            $t->boolean('done')->default(false);
            $t->dateTime('done_at')->nullable();
            $t->integer('remind_minutes')->nullable();
            $t->dateTime('remind_at')->nullable();
            $t->dateTime('notified_at')->nullable();
            $t->integer('position')->default(0);
            $t->timestamps();
            $t->index(['date', 'done']);
            $t->index('remind_at');
        });

        Schema::create('settlements', function (Blueprint $t) {
            $t->id();
            $t->string('direction', 12); // payable (постачальнику) | receivable (від клієнта)
            $t->string('counterparty');
            $t->string('title');
            $t->decimal('amount', 14, 2);
            $t->date('date')->nullable();
            $t->date('due_date')->nullable();
            $t->boolean('closed')->default(false);
            $t->text('note')->nullable();
            $t->date('notified_on')->nullable();
            $t->timestamps();
        });

        Schema::create('utilities', function (Blueprint $t) {
            $t->id();
            $t->string('service', 60);
            $t->string('period', 7); // YYYY-MM
            $t->decimal('meter_prev', 14, 3)->nullable();
            $t->decimal('meter_curr', 14, 3)->nullable();
            $t->decimal('tariff', 14, 4)->nullable();
            $t->decimal('amount', 14, 2)->default(0);
            $t->date('due_date')->nullable();
            $t->boolean('paid')->default(false);
            $t->date('paid_date')->nullable();
            $t->text('note')->nullable();
            $t->date('notified_on')->nullable();
            $t->timestamps();
        });

        Schema::create('transactions', function (Blueprint $t) {
            $t->id();
            $t->string('type', 10); // income | expense
            $t->string('scope', 20)->nullable(); // production | home | personal
            $t->string('kind', 20)->default('regular'); // regular | supplier | client | investment | utility
            $t->string('category', 60);
            $t->decimal('amount', 14, 2);
            $t->date('date');
            $t->string('counterparty')->nullable();
            $t->text('note')->nullable();
            $t->foreignId('settlement_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('utility_id')->nullable()->constrained()->cascadeOnDelete();
            $t->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $t->timestamps();
            $t->index('date');
        });

        Schema::create('push_subscriptions', function (Blueprint $t) {
            $t->id();
            $t->string('endpoint', 700)->unique();
            $t->string('p256dh');
            $t->string('auth');
            $t->string('user_agent')->nullable();
            $t->timestamps();
        });

        Schema::create('settings', function (Blueprint $t) {
            $t->string('key')->primary();
            $t->text('value')->nullable();
        });
    }

    public function down(): void
    {
        foreach (['settings', 'push_subscriptions', 'transactions', 'utilities', 'settlements', 'tasks', 'projects', 'leads'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
