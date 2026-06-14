<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencias_docentes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('docente_id')->constrained('docentes')->onDelete('cascade');
            $table->foreignId('grupo_id')->constrained('grupos')->onDelete('cascade');
            $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
            $table->foreignId('horario_id')->constrained('horarios')->onDelete('cascade');
            $table->date('fecha');
            $table->string('estado');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->unique(['docente_id', 'grupo_id', 'materia_id', 'fecha'], 'asistencia_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias_docentes');
    }
};
