<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emergency_contact_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('emergency_session_id');
            $table->uuid('emergency_contact_id');
            $table->string('token', 64)->unique();
            $table->string('code', 8);
            $table->boolean('used')->default(false);
            $table->timestamps();

            $table->foreign('emergency_session_id')->references('id')->on('emergency_sessions')->onDelete('cascade');
            $table->foreign('emergency_contact_id')->references('id')->on('emergency_contacts')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emergency_contact_tokens');
    }
};
