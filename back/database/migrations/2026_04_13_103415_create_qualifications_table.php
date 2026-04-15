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
        Schema::create('qualifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('practicien_id')->constrained();
            $table->string('code');
            $table->string('nom');
            $table->string('specialite');
            $table->string('type');
            $table->date('debut_validite');
            $table->date('fin_validite');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qualifications');
    }
};
