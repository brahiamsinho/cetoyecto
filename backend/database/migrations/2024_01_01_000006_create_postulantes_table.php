<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('postulantes', function (Blueprint $table) {
            $table->id();
            $table->string('ci')->unique();
            $table->string('nombres');
            $table->string('apellidos');
            $table->date('fecha_nacimiento');
            $table->string('sexo');
            $table->text('direccion')->nullable();
            $table->string('telefono')->nullable();
            $table->string('email')->unique();
            $table->string('colegio_procedencia');
            $table->string('ciudad');
            $table->foreignId('carrera_primera_id')->constrained('carreras')->onDelete('cascade');
            $table->foreignId('carrera_segunda_id')->nullable()->constrained('carreras')->onDelete('cascade');
            $table->boolean('titulo_bachiller')->default(false);
            $table->foreignId('gestion_id')->constrained('gestiones')->onDelete('cascade');
            $table->string('estado')->default('pendiente');
            $table->foreignId('carrera_asignada_id')->nullable()->constrained('carreras')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();

            $table->index('ci');
            $table->index('email');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('postulantes');
    }
};
