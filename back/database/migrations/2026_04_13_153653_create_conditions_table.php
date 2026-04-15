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
        Schema::create('conditions', function (Blueprint $table) {
            $table->uuid('id');
            $table->foreignUuid('patient_id')->nullable();
            $table->foreignUuid('visite_id')->nullable();
            $table->string('code_diagnostic');
            $table->string('nom_diagnostic');
            $table->enum('statut_clinique', ['actif', 'inactif', 'remission', 'resolu'])->default('actif');
            $table->enum('statut_verification', ['provisoire', 'confirme', 'refute'])->default('provisoire');
            $table->string('severite')->nullable();
            $table->dateTime('date_apparition')->nullable();
            $table->dateTime('date_resolution')->nullable();
            $table->foreignUuid('practicien_id')->nullable()->references('id')->on('practiciens');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conditions');
    }
};
