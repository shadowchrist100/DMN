<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emergency_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_user_id');
            $table->uuid('practitioner_user_id');
            $table->timestamp('expires_at');
            $table->string('status')->default('en_attente'); // en_attente, approuve_contact, force_praticien, expire
            $table->timestamps();

            $table->foreign('patient_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('practitioner_user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emergency_sessions');
    }
};
