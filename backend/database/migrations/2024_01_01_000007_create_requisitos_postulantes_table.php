<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requisitos_postulantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('postulante_id')->constrained('postulantes')->onDelete('cascade');
            $table->string('tipo_requisito');
            $table->boolean('cumplido')->default(false);
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->unique(['postulante_id', 'tipo_requisito']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requisitos_postulantes');
    }
};
