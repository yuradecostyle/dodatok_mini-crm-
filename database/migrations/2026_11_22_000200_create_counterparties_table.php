<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** Довідник контрагентів: постачальники, клієнти, інвестори. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('counterparties', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('type', 20)->default('supplier'); // supplier | client | investor | other
            $t->string('phone')->nullable();
            $t->string('contact')->nullable();
            $t->text('note')->nullable();
            $t->timestamps();
            $t->index('name');
        });

        // Переносимо імена, які вже вводилися в операціях і розрахунках
        $seen = [];
        $add = function (?string $name, string $type) use (&$seen) {
            $name = trim((string) $name);
            $key = mb_strtolower($name);
            if ($name === '' || isset($seen[$key])) {
                return;
            }
            $seen[$key] = true;
            DB::table('counterparties')->insert(['name' => $name, 'type' => $type, 'created_at' => now(), 'updated_at' => now()]);
        };
        foreach (DB::table('settlements')->get(['counterparty', 'direction']) as $s) {
            $add($s->counterparty, $s->direction === 'payable' ? 'supplier' : 'client');
        }
        foreach (DB::table('transactions')->whereNotNull('counterparty')->get(['counterparty', 'type', 'kind']) as $t) {
            $add($t->counterparty, $t->kind === 'investment' ? 'investor' : ($t->type === 'income' ? 'client' : 'supplier'));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('counterparties');
    }
};
