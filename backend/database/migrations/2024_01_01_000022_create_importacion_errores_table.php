<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('importacion_errores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('importacion_id')->constrained('importaciones')->onDelete('cascade');
            $table->integer('fila');
            $table->string('campo')->nullable();
            $table->text('error');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('importacion_errores');
    }
};
