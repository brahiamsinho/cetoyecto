<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grupo_postulante', function (Blueprint $table) {
            if (!Schema::hasColumn('grupo_postulante', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });

        // Also check grupo_materia pivot
        Schema::table('grupo_materia', function (Blueprint $table) {
            if (!Schema::hasColumn('grupo_materia', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        // No down - keep columns
    }
};
