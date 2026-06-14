<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facultades', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('nombre');
            $table->integer('capacidad_grupo')->default(30);
            $table->integer('cupo_sistemas')->default(0);
            $table->integer('cupo_informatica')->default(0);
            $table->integer('cupo_redes')->default(0);
            $table->integer('cupo_robotica')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facultades');
    }
};
