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
        Schema::create('diagnostic_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('statut', ['provisoire', 'final', 'corrige', 'annule']);
            $table->string('categorie');
            $table->string('code'); //type
            $table->foreignUuid('patient_id')->constrained();
            $table->foreignUuid('visite_id')->constrained();
            $table->date('effective_at');
            $table->date('publie');
            $table->foreignUuid('practicien_id')->constrained('practiciens');
            $table->text('conclusion');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnostic_reports');
    }
};
