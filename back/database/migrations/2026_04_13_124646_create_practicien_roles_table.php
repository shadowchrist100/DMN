<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('practicien_roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('practicien_id')->constrained();
            $table->foreignUuid('organisation_id')->constrained();
            $table->boolean('est_actif')->default(true);
            $table->string('role');
            $table->string('code_role')->nullable();
            $table->date('debut_validite')->nullable();
            $table->date('fin_validite')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practicien_roles');
    }
};
