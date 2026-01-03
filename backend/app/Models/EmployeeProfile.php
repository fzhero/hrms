<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeProfile extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'employee_profiles';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'phone',
        'address',
        'department',
        'designation',
        'joining_date',
        'salary',
        'profile_photo',
        'documents',
        // Personal Details
        'date_of_birth',
        'nationality',
        'personal_email',
        'gender',
        'marital_status',
        // Bank Details
        'account_number',
        'bank_name',
        'ifsc_code',
        'pan_no',
        'uan_no',
        'emp_code',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'joining_date' => 'date',
        'date_of_birth' => 'date',
        'salary' => 'decimal:2',
        'documents' => 'array',
    ];

    /**
     * Get the user that owns the employee profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

