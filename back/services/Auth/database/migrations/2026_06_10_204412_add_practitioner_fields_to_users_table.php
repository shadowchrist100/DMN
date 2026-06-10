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
        Schema::table('users', function (Blueprint $table) {
            $table->string('order_number')->nullable()->after('address');
            $table->string('speciality')->nullable()->after('order_number');
            $table->string('organization_name')->nullable()->after('speciality');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['order_number', 'speciality', 'organization_name']);
        });
    }
};
