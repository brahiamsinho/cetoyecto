<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('postulantes', function (Blueprint $table) {
            $table->string('carnet_identidad_path')->nullable()->after('estado');
            $table->string('foto_path')->nullable()->after('carnet_identidad_path');
            $table->string('diploma_bachiller_path')->nullable()->after('foto_path');
        });
    }

    public function down(): void
    {
        Schema::table('postulantes', function (Blueprint $table) {
            $table->dropColumn(['carnet_identidad_path', 'foto_path', 'diploma_bachiller_path']);
        });
    }
};
