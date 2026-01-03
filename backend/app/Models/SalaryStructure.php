<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryStructure extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'monthly_wage',
        'yearly_wage',
        'working_days_per_week',
        'break_time_hours',
        'basic_salary',
        'hra',
        'standard_allowance',
        'performance_bonus',
        'lta',
        'fixed_allowance',
        'pf_employee',
        'pf_employer',
        'professional_tax',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'monthly_wage' => 'decimal:2',
        'yearly_wage' => 'decimal:2',
        'working_days_per_week' => 'integer',
        'break_time_hours' => 'decimal:2',
        'basic_salary' => 'decimal:2',
        'hra' => 'decimal:2',
        'standard_allowance' => 'decimal:2',
        'performance_bonus' => 'decimal:2',
        'lta' => 'decimal:2',
        'fixed_allowance' => 'decimal:2',
        'pf_employee' => 'decimal:2',
        'pf_employer' => 'decimal:2',
        'professional_tax' => 'decimal:2',
    ];

    /**
     * Get the user that owns the salary structure.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate salary components based on monthly wage
     */
    public static function calculateComponents($monthlyWage)
    {
        $basicSalary = $monthlyWage * 0.50; // 50%
        $hra = $basicSalary * 0.50; // 50% of basic
        $standardAllowance = $basicSalary * 0.1667; // 16.67%
        $performanceBonus = $basicSalary * 0.0833; // 8.33%
        $lta = $basicSalary * 0.0833; // 8.33%
        $fixedAllowance = $monthlyWage - ($basicSalary + $hra + $standardAllowance + $performanceBonus + $lta);
        $pfEmployee = $basicSalary * 0.12; // 12%
        $pfEmployer = $basicSalary * 0.12; // 12%
        $professionalTax = 200.00; // Fixed

        return [
            'basic_salary' => round($basicSalary, 2),
            'hra' => round($hra, 2),
            'standard_allowance' => round($standardAllowance, 2),
            'performance_bonus' => round($performanceBonus, 2),
            'lta' => round($lta, 2),
            'fixed_allowance' => round($fixedAllowance, 2),
            'pf_employee' => round($pfEmployee, 2),
            'pf_employer' => round($pfEmployer, 2),
            'professional_tax' => round($professionalTax, 2),
        ];
    }
}
