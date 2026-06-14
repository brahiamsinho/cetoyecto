<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carga_horaria_docente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('docente_id')->constrained('docentes')->onDelete('cascade');
            $table->foreignId('grupo_id')->constrained('grupos')->onDelete('cascade');
            $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
            $table->foreignId('aula_id')->constrained('aulas')->onDelete('cascade');
            $table->foreignId('horario_id')->constrained('horarios')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['docente_id', 'horario_id'], 'chd_docente_horario_unique');
            $table->unique(['aula_id', 'horario_id'], 'chd_aula_horario_unique');
            $table->unique(['grupo_id', 'materia_id'], 'chd_grupo_materia_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carga_horaria_docente');
    }
};
