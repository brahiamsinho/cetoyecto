<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes_ia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('prompt_usuario');
            $table->string('titulo')->nullable();
            $table->text('resumen')->nullable();
            $table->json('columnas')->nullable();
            $table->json('filas')->nullable();
            $table->json('conclusiones')->nullable();
            $table->string('archivo_pdf')->nullable();
            $table->string('archivo_excel')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes_ia');
    }
};
