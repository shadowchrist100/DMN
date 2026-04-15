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
        Schema::create('observations', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('patient_id')->constrained();
            $table->foreignUuid('practicien_id')->constrained();
            $table->enum('status',['provisoire,final']);
            $table->string('categorie');
            $table->string('code_standard');
            $table->json('valeur_json');
            
            // temps mesure
            $table->dateTime('date_mesure');
            $table->dateTime('debut_effectif');
            $table->dateTime('fin_effectif');
            $table->dateTime('date_publication');

            // analyse de la mesure
            $table->string('interpretation')->nullable();
            $table->json('normes_reference')->nullable();
            $table->text('note');

            $table->string('methode')->nullable();
            $table->string('site_corporel')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('observations');
    }
};
