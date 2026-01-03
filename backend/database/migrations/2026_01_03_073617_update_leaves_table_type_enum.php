<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Update the type enum to match the validation rules
        DB::statement("ALTER TABLE leaves MODIFY COLUMN type ENUM('sick', 'annual', 'casual', 'emergency', 'other', 'paid', 'unpaid') DEFAULT 'casual'");
        
        // Add attachment column if it doesn't exist
        if (!Schema::hasColumn('leaves', 'attachment')) {
            Schema::table('leaves', function (Blueprint $table) {
                $table->string('attachment')->nullable()->after('reason');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revert to original enum
        DB::statement("ALTER TABLE leaves MODIFY COLUMN type ENUM('paid', 'sick', 'unpaid') DEFAULT 'unpaid'");
        
        // Remove attachment column if it exists
        if (Schema::hasColumn('leaves', 'attachment')) {
            Schema::table('leaves', function (Blueprint $table) {
                $table->dropColumn('attachment');
            });
        }
    }
};
