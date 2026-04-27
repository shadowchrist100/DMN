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
        Schema::create('telecoms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('owner_id'); // owner_id
            $table->string('owner_type'); // owner_type
            $table->enum('systeme', ['telephone', 'email', 'url', 'sms']);
            $table->string('valeur');
            $table->enum('usage', ['prive', 'travail', 'mobile']); // use
            $table->integer('priorite')->default(1); // rang
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telecoms');
    }
};
