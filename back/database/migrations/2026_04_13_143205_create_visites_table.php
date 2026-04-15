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
        Schema::create('visites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained();
            $table->foreignUuid('organisation_id')->constrained();
            $table->enum('status',['planifie', 'en_cours', 'termine', 'annule']);
            $table->string('type');
            $table->string('priorite');
            $table->dateTime('debut_reel');
            $table->dateTime('fin_reel');
            $table->string('motif_code');
            $table->json('donnees_diagnostiques');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visites');
    }
};
