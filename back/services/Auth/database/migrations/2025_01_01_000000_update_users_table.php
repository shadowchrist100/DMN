<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('name');
            $table->string('first_name')->after('id');
            $table->string('last_name')->after('first_name');
            $table->string('npi')->nullable()->after('email_verified_at');
            $table->string('genre')->nullable()->after('npi');
            $table->date('birth_date')->nullable()->after('genre');
            $table->string('photo_path')->nullable()->after('birth_date');
            $table->string('role')->default('patient')->after('photo_path');
            $table->string('phone')->nullable()->after('role');
            $table->string('matrimonial_status')->nullable()->after('phone');
            $table->string('status_account')->default('unverified')->after('matrimonial_status');
            $table->string('city')->nullable()->after('status_account');
            $table->string('address')->nullable()->after('city');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name', 'last_name', 'npi', 'genre', 'birth_date',
                'photo_path', 'role', 'phone', 'matrimonial_status',
                'status_account', 'city', 'address',
            ]);
            $table->string('name')->after('id');
        });
    }
};
