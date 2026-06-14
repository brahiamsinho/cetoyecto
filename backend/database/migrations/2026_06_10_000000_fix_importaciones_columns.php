<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('importaciones', function (Blueprint $table) {
            $table->dropColumn(['filas_exitosas', 'filas_error', 'estado']);
            $table->integer('exitosas')->default(0);
            $table->integer('fallidas')->default(0);
            $table->boolean('finalizada')->default(false);
            $table->json('errores')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('importaciones', function (Blueprint $table) {
            $table->dropColumn(['exitosas', 'fallidas', 'finalizada', 'errores']);
            $table->integer('filas_exitosas')->default(0);
            $table->integer('filas_error')->default(0);
            $table->string('estado')->default('procesando');
        });
    }
};
