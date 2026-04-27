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
        Schema::create('related_people', function (Blueprint $table) {
            // Utilise $table->uuid('id')->primary() si tu veux des UUID partout
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->onDelete('cascade');
            $table->boolean('est_actif')->default(true);
            $table->enum('code_relation', [
                'parent',
                'enfant',
                'conjoint',
                'frere_soeur',
                'tuteur',
                'contact_urgence',
                'medecin_referent'
            ]);
            $table->string('nom');
            $table->string('prenom')->nullable();
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
        Schema::dropIfExists('related_people');
    }
};
