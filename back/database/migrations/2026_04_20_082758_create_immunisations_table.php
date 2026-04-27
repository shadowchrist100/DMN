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
        Schema::create('immunisations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained();
            $table->foreignUuid('practicien_id')->nullable()->constrained();
            $table->string('nom');
            $table->string('vaccin_code'); // ex: DTP, Grippe
            $table->string('site_injection')->nullable();  // bras gauche, cuisse...
            $table->string('fabricant')->nullable();
            $table->string('dose_sequence')->nullable();   // 1ère dose, rappel...
            $table->string('numero_lot')->nullable();
            $table->dateTime('date_administration');
            $table->date('prochain_rappel')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('immunisations');
    }
};
