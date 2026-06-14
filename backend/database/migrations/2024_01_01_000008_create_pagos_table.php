<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('postulante_id')->unique()->constrained('postulantes')->onDelete('cascade');
            $table->decimal('monto', 10, 2);
            $table->string('codigo_transaccion')->unique()->nullable();
            $table->string('estado')->default('pendiente');
            $table->timestamp('fecha_pago')->nullable();
            $table->string('metodo_pago')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
