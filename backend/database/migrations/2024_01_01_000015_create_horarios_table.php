<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->string('dia');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->string('turno');
            $table->timestamps();

            $table->unique(['dia', 'hora_inicio', 'hora_fin']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios');
    }
};
