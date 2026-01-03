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
        Schema::create('salary_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Wage Summary
            $table->decimal('monthly_wage', 12, 2)->default(0);
            $table->decimal('yearly_wage', 12, 2)->default(0);
            $table->integer('working_days_per_week')->default(5);
            $table->decimal('break_time_hours', 4, 2)->default(1.0);
            
            // Salary Components
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->decimal('hra', 12, 2)->default(0); // House Rent Allowance
            $table->decimal('standard_allowance', 12, 2)->default(0);
            $table->decimal('performance_bonus', 12, 2)->default(0);
            $table->decimal('lta', 12, 2)->default(0); // Leave Travel Allowance
            $table->decimal('fixed_allowance', 12, 2)->default(0);
            
            // PF Contribution
            $table->decimal('pf_employee', 12, 2)->default(0);
            $table->decimal('pf_employer', 12, 2)->default(0);
            
            // Tax Deductions
            $table->decimal('professional_tax', 12, 2)->default(0);
            
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->unique('user_id'); // One salary structure per user
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_structures');
    }
};
