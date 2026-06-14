<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('postulante_id')->constrained('postulantes')->onDelete('cascade');
            $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
            $table->decimal('nota1', 5, 2)->default(0);
            $table->decimal('nota2', 5, 2)->default(0);
            $table->decimal('nota3', 5, 2)->default(0);
            $table->decimal('promedio', 5, 2)->default(0);
            $table->timestamps();

            $table->unique(['postulante_id', 'materia_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas');
    }
};
