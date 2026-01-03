<?php

namespace App\Services;

class PasswordGenerator
{
    /**
     * Generate a secure random password
     * 
     * @param int $length - Password length (default: 12)
     * @return string
     */
    public static function generate(int $length = 12): string
    {
        // Character sets
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        // Combine all character sets
        $allChars = $uppercase . $lowercase . $numbers . $symbols;
        
        // Ensure at least one character from each set
        $password = '';
        $password .= $uppercase[random_int(0, strlen($uppercase) - 1)];
        $password .= $lowercase[random_int(0, strlen($lowercase) - 1)];
        $password .= $numbers[random_int(0, strlen($numbers) - 1)];
        $password .= $symbols[random_int(0, strlen($symbols) - 1)];
        
        // Fill the rest randomly
        $remainingLength = $length - 4;
        for ($i = 0; $i < $remainingLength; $i++) {
            $password .= $allChars[random_int(0, strlen($allChars) - 1)];
        }
        
        // Shuffle the password to avoid predictable pattern
        return str_shuffle($password);
    }
    
    /**
     * Generate a simpler password (for easy sharing)
     * Format: Uppercase letters and numbers only
     * 
     * @param int $length - Password length (default: 10)
     * @return string
     */
    public static function generateSimple(int $length = 10): string
    {
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $numbers = '0123456789';
        $allChars = $uppercase . $numbers;
        
        $password = '';
        for ($i = 0; $i < $length; $i++) {
            $password .= $allChars[random_int(0, strlen($allChars) - 1)];
        }
        
        return $password;
    }
}


