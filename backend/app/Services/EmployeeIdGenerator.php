<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EmployeeIdGenerator
{
    /**
     * Generate Employee ID based on format:
     * [Company Code][First 2 letters of first name][First 2 letters of last name][Year][Serial Number]
     * Example: OIJODO20220001
     * 
     * @param string $firstName
     * @param string $lastName
     * @param string|null $companyName - Optional company name for company code
     * @param string|null $joiningDate - Optional joining date (defaults to current year)
     * @return string
     */
    public static function generate(string $firstName, string $lastName, ?string $companyName = null, ?string $joiningDate = null): string
    {
        // 1. Get Company Code (first 2 uppercase letters of company name)
        $companyCode = self::getCompanyCode($companyName);
        
        // 2. Get first 2 letters of first name (uppercase)
        $firstNameCode = strtoupper(substr(trim($firstName), 0, 2));
        // If name is less than 2 characters, pad with X
        if (strlen($firstNameCode) < 2) {
            $firstNameCode = str_pad($firstNameCode, 2, 'X', STR_PAD_RIGHT);
        }
        
        // 3. Get first 2 letters of last name (uppercase)
        $lastNameCode = strtoupper(substr(trim($lastName), 0, 2));
        // If name is less than 2 characters, pad with X
        if (strlen($lastNameCode) < 2) {
            $lastNameCode = str_pad($lastNameCode, 2, 'X', STR_PAD_RIGHT);
        }
        
        // 4. Get Year of Joining
        $year = self::getJoiningYear($joiningDate);
        
        // 5. Get Serial Number for that year
        $serialNumber = self::getSerialNumber($companyCode, $year);
        
        // Combine all parts
        $employeeId = $companyCode . $firstNameCode . $lastNameCode . $year . $serialNumber;
        
        return $employeeId;
    }
    
    /**
     * Get Company Code from company name
     * Takes first 2 uppercase letters
     * Defaults to "OI" (Odoo India) or config value
     * 
     * @param string|null $companyName
     * @return string
     */
    protected static function getCompanyCode(?string $companyName): string
    {
        if ($companyName && strlen(trim($companyName)) >= 2) {
            // Extract first 2 letters from company name (uppercase)
            // Remove all non-alphabetic characters first
            $code = preg_replace('/[^A-Za-z]/', '', trim($companyName));
            $code = strtoupper($code);
            
            // If we have at least 2 letters, use them
            if (strlen($code) >= 2) {
                return substr($code, 0, 2);
            }
        }
        
        // Default company code from config or environment
        return strtoupper(env('COMPANY_CODE', 'OI'));
    }
    
    /**
     * Get Year of Joining
     * 
     * @param string|null $joiningDate
     * @return string
     */
    protected static function getJoiningYear(?string $joiningDate): string
    {
        if ($joiningDate) {
            try {
                return Carbon::parse($joiningDate)->format('Y');
            } catch (\Exception $e) {
                // Invalid date, use current year
            }
        }
        
        // Default to current year
        return Carbon::now()->format('Y');
    }
    
    /**
     * Get Serial Number for the year
     * Counts existing employees with same company code and year, then increments
     * 
     * @param string $companyCode
     * @param string $year
     * @return string - 4 digit serial number (e.g., 0001)
     */
    protected static function getSerialNumber(string $companyCode, string $year): string
    {
        // Pattern to match: [CompanyCode][NameCode][NameCode][Year][Serial]
        // We need to find all employee IDs that match the pattern for this company and year
        $pattern = $companyCode . '[A-Z]{4}' . $year;
        
        // Get all users and filter by pattern
        $users = User::whereNotNull('employee_id')
            ->where('employee_id', 'LIKE', $pattern . '%')
            ->get();
        
        $maxSerial = 0;
        
        foreach ($users as $user) {
            // Extract serial number (last 4 digits)
            $serial = intval(substr($user->employee_id, -4));
            if ($serial > $maxSerial) {
                $maxSerial = $serial;
            }
        }
        
        // Increment for new employee
        $nextSerial = $maxSerial + 1;
        
        // Format as 4 digit string (e.g., 0001, 0002, etc.)
        return str_pad($nextSerial, 4, '0', STR_PAD_LEFT);
    }
    
    /**
     * Parse full name into first name and last name
     * 
     * @param string $fullName
     * @return array ['firstName' => string, 'lastName' => string]
     */
    public static function parseName(string $fullName): array
    {
        $nameParts = explode(' ', trim($fullName));
        
        if (count($nameParts) === 1) {
            // Only one word, use it as first name
            return [
                'firstName' => $nameParts[0],
                'lastName' => $nameParts[0], // Use same for last name if only one word
            ];
        }
        
        // First part is first name, rest is last name
        $firstName = array_shift($nameParts);
        $lastName = implode(' ', $nameParts);
        
        return [
            'firstName' => $firstName,
            'lastName' => $lastName,
        ];
    }
}

