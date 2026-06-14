<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grupos', function (Blueprint $table) {
            $table->foreignId('facultad_id')->nullable()->after('gestion_id')
                ->constrained('facultades')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('grupos', function (Blueprint $table) {
            $table->dropForeign(['facultad_id']);
            $table->dropColumn('facultad_id');
        });
    }
};
