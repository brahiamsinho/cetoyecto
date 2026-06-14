<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grupo_materia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grupo_id')->constrained('grupos')->onDelete('cascade');
            $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['grupo_id', 'materia_id']);
        });

        // Remove direct materia_id from grupos (now many-to-many)
        if (Schema::hasColumn('grupos', 'materia_id')) {
            Schema::table('grupos', function (Blueprint $table) {
                $table->dropForeign(['materia_id']);
                $table->dropColumn('materia_id');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('grupos', 'materia_id')) {
            Schema::table('grupos', function (Blueprint $table) {
                $table->foreignId('materia_id')->nullable()->constrained('materias')->onDelete('set null');
            });
        }

        Schema::dropIfExists('grupo_materia');
    }
};
