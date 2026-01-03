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
        // Use raw SQL to modify the column (doesn't require Doctrine DBAL)
        DB::statement('ALTER TABLE `users` MODIFY COLUMN `employee_id` VARCHAR(255) NULL');
        
        // Re-add unique constraint if it was dropped
        Schema::table('users', function (Blueprint $table) {
            // Check if unique constraint exists, if not add it
            $indexes = DB::select("SHOW INDEXES FROM users WHERE Column_name = 'employee_id' AND Non_unique = 0");
            if (empty($indexes)) {
                $table->unique('employee_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This will fail if there are any NULL values
        // First, ensure all employee_ids are not null
        DB::statement('UPDATE `users` SET `employee_id` = CONCAT("EMP", id) WHERE `employee_id` IS NULL');
        
        // Make column non-nullable
        DB::statement('ALTER TABLE `users` MODIFY COLUMN `employee_id` VARCHAR(255) NOT NULL');
    }
};

