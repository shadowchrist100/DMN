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
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('first_name')->after('id');
            $table->string('last_name')->after('first_name');
            $table->string('npi')->after('email_verified_at');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('gender')->after('npi');
            $table->date('birth_date')->after('gender');
            $table->string('photo_path')->nullable()->after('birth_date');
            $table->string('role')->default('patient')->after('photo_path');
            $table->string('phone')->after('role');
            $table->string('matrimonial_status')->after('phone');
            $table->string('status_account')->default('unverified')->after('matrimonial_status');
            $table->string('city')->after('status_account');
            $table->string('address')->after('city');;
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
