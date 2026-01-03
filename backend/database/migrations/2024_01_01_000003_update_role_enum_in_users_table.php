<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update role enum to only include 'admin' and 'employee'
        // First, update any 'hr' roles to 'employee'
        DB::table('users')->where('role', 'hr')->update(['role' => 'employee']);
        
        Schema::table('users', function (Blueprint $table) {
            // Drop the old enum column
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            // Add new enum with only admin and employee
            $table->enum('role', ['admin', 'employee'])
                  ->default('employee')
                  ->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['employee', 'hr', 'admin'])
                  ->default('employee')
                  ->after('email');
        });
    }
};

