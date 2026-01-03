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
        Schema::table('employee_profiles', function (Blueprint $table) {
            // Personal Details
            $table->date('date_of_birth')->nullable()->after('joining_date');
            $table->string('nationality')->nullable()->after('date_of_birth');
            $table->string('personal_email')->nullable()->after('nationality');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('personal_email');
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->nullable()->after('gender');
            
            // Bank Details
            $table->string('account_number')->nullable()->after('marital_status');
            $table->string('bank_name')->nullable()->after('account_number');
            $table->string('ifsc_code')->nullable()->after('bank_name');
            $table->string('pan_no')->nullable()->after('ifsc_code');
            $table->string('uan_no')->nullable()->after('pan_no');
            $table->string('emp_code')->nullable()->after('uan_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'nationality',
                'personal_email',
                'gender',
                'marital_status',
                'account_number',
                'bank_name',
                'ifsc_code',
                'pan_no',
                'uan_no',
                'emp_code',
            ]);
        });
    }
};
