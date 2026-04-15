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
        Schema::create('practiciens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean('est_actif');
            $table->string('nom');
            $table->string('prenom');
            $table->enum('genre', ['masculin', 'feminin', 'autre', 'inconnu']);
            $table->date('date_naissance');
            $table->json('addresse_json')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practiciens');
    }
};
