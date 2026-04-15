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
        Schema::create('allergies_intolerances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained();
            $table->enum('type', ['allergie', 'intolerance']);
            $table->enum('categorie', ['nourriture', 'medicament','environnement','biologique']);
            $table->string('nom');
            $table->enum('criticite', ['faible', 'elevee', 'incapable_d_evaluer']);
            $table->enum('statut_clinique', ['actif', 'inactif', 'resolu']);
            $table->json('reactions_json');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('allergies_intolerances');
    }
};
