<?php

namespace App\Services;

class PasswordValidator
{
    /**
     * Validate password strength
     * 
     * @param string $password
     * @param string|null $email
     * @param string|null $employeeId
     * @return array ['valid' => bool, 'errors' => array]
     */
    public static function validate($password, $email = null, $employeeId = null)
    {
        $errors = [];
        
        // Minimum length
        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters long.';
        }
        
        // Maximum length (security best practice)
        if (strlen($password) > 128) {
            $errors[] = 'Password must not exceed 128 characters.';
        }
        
        // Uppercase letter
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter.';
        }
        
        // Lowercase letter
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter.';
        }
        
        // Number
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number.';
        }
        
        // Special character
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $errors[] = 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?).';
        }
        
        // Cannot match email
        if ($email && strtolower($password) === strtolower($email)) {
            $errors[] = 'Password cannot be the same as your email address.';
        }
        
        // Cannot match employee ID
        if ($employeeId && strtolower($password) === strtolower($employeeId)) {
            $errors[] = 'Password cannot be the same as your Employee ID.';
        }
        
        // Check if password contains email (partial match)
        if ($email && stripos($password, $email) !== false) {
            $errors[] = 'Password cannot contain your email address.';
        }
        
        // Check if password contains employee ID (partial match)
        if ($employeeId && stripos($password, $employeeId) !== false) {
            $errors[] = 'Password cannot contain your Employee ID.';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Get password requirements as a string
     * 
     * @return string
     */
    public static function getRequirements()
    {
        return 'Password must be 8-128 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }
}

