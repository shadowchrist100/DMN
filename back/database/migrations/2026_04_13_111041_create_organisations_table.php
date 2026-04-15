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
        Schema::create('organisations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean(('est_actif'))->default(true);
            $table->string('type');
            $table->string('nom');
            $table->string('alias');
            $table->text('description');
            $table->uuid('part_of_id')->nullable();
            $table->foreign('part_of_id')->references('id')->on('organisations');
            $table->text('contrat_details')->nullable();
            $table->string('agrement_qualification')->nullable();
            $table->json('addresse_json')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organisations');
    }
};
