<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('importaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('tipo');
            $table->string('archivo');
            $table->integer('total_filas')->default(0);
            $table->integer('filas_exitosas')->default(0);
            $table->integer('filas_error')->default(0);
            $table->string('estado')->default('procesando');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('importaciones');
    }
};
