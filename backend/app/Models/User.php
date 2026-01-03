<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password_changed_at' => 'datetime',
    ];
    
    /**
     * Check if user has changed their password
     * Returns false if using system-generated password (first login)
     * 
     * @return bool
     */
    public function hasChangedPassword(): bool
    {
        return !is_null($this->password_changed_at);
    }
    
    /**
     * Check if this is user's first login
     * 
     * @return bool
     */
    public function isFirstLogin(): bool
    {
        return is_null($this->password_changed_at);
    }

    /**
     * Get the employee profile associated with the user.
     */
    public function employeeProfile()
    {
        return $this->hasOne(EmployeeProfile::class);
    }

    /**
     * Get the attendances for the user.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get the leaves for the user.
     */
    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    /**
     * Get the payrolls for the user.
     */
    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    /**
     * Get the salary structure for the user.
     */
    public function salaryStructure()
    {
        return $this->hasOne(\App\Models\SalaryStructure::class);
    }
}

