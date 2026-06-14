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
            $table->dropColumn(['carnet_identidad_path', 'foto_path', 'diploma_bachiller_path']);
        });
        Schema::table('postulantes', function (Blueprint $table) {
            $table->boolean('tiene_carnet_identidad')->default(false)->after('carrera_segunda_id');
            $table->boolean('tiene_foto')->default(false)->after('tiene_carnet_identidad');
            $table->boolean('tiene_diploma_bachiller')->default(false)->after('tiene_foto');
        });
    }

    public function down(): void
    {
        Schema::table('postulantes', function (Blueprint $table) {
            $table->dropColumn(['tiene_carnet_identidad', 'tiene_foto', 'tiene_diploma_bachiller']);
        });
    }
};
