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
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained();
            $table->foreignUuid('practicien_id')->constrained();
            $table->foreignUuid('visite_id')->nullable()->constrained();
            $table->string('nom_medicament');
            $table->enum('statut', ['actif', 'suspendu', 'annule', 'termine']);
            $table->dateTime('date_prescription');
            $table->json('posologie_json');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
