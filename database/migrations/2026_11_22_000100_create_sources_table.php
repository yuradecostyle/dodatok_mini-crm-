<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** Рекламні канали (джерела лідів) — тепер редагований список. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sources', function (Blueprint $t) {
            $t->id();
            $t->string('name', 60);
            $t->string('channel', 20)->default('other');
            $t->integer('position')->default(0);
            $t->timestamps();
        });

        $defaults = [
            'viber_personal' => ['Особистий Viber', 'viber'],
            'viber_work' => ['Робочий Viber', 'viber'],
            'telegram_personal' => ['Особистий Telegram', 'telegram'],
            'telegram_work' => ['Робочий Telegram', 'telegram'],
        ];
        $ids = [];
        $pos = 0;
        foreach ($defaults as $key => [$name, $channel]) {
            $ids[$key] = DB::table('sources')->insertGetId([
                'name' => $name, 'channel' => $channel, 'position' => ++$pos,
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        Schema::table('leads', function (Blueprint $t) {
            $t->foreignId('source_id')->nullable()->after('request')->constrained('sources')->nullOnDelete();
        });
        Schema::table('leads', function (Blueprint $t) {
            $t->string('source', 40)->nullable()->change();
        });
        foreach ($ids as $key => $id) {
            DB::table('leads')->where('source', $key)->update(['source_id' => $id]);
        }
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $t) {
            $t->dropConstrainedForeignId('source_id');
        });
        Schema::dropIfExists('sources');
    }
};
