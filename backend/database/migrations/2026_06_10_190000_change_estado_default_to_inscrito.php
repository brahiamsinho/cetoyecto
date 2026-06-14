<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing pendiente to inscrito
        DB::table('postulantes')->where('estado', 'pendiente')->update(['estado' => 'inscrito']);

        // Change default for new records
        Schema::table('postulantes', function (Blueprint $table) {
            $table->string('estado')->default('inscrito')->change();
        });
    }

    public function down(): void
    {
        Schema::table('postulantes', function (Blueprint $table) {
            $table->string('estado')->default('pendiente')->change();
        });
    }
};
