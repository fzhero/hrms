<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\EmployeeProfile;
use App\Services\EmployeeIdGenerator;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TestEmployeesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $testEmployees = [
            [
                'name' => 'John Smith',
                'email' => 'john.smith@test.com',
                'password' => 'Test@1234',
                'phone' => '+1-555-0101',
                'department' => 'Engineering',
                'designation' => 'Senior Software Engineer',
                'address' => '123 Main Street, New York, NY 10001',
                'joining_date' => '2024-01-15',
                'salary' => 75000.00
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@test.com',
                'password' => 'Test@1234',
                'phone' => '+1-555-0102',
                'department' => 'Marketing',
                'designation' => 'Marketing Manager',
                'address' => '456 Oak Avenue, Los Angeles, CA 90001',
                'joining_date' => '2024-02-01',
                'salary' => 65000.00
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'michael.chen@test.com',
                'password' => 'Test@1234',
                'phone' => '+1-555-0103',
                'department' => 'Sales',
                'designation' => 'Sales Executive',
                'address' => '789 Pine Road, Chicago, IL 60601',
                'joining_date' => '2024-03-10',
                'salary' => 55000.00
            ],
            [
                'name' => 'Emily Davis',
                'email' => 'emily.davis@test.com',
                'password' => 'Test@1234',
                'phone' => '+1-555-0104',
                'department' => 'HR',
                'designation' => 'HR Manager',
                'address' => '321 Elm Street, Houston, TX 77001',
                'joining_date' => '2024-01-20',
                'salary' => 70000.00
            ],
            [
                'name' => 'David Wilson',
                'email' => 'david.wilson@test.com',
                'password' => 'Test@1234',
                'phone' => '+1-555-0105',
                'department' => 'Finance',
                'designation' => 'Financial Analyst',
                'address' => '654 Maple Drive, Phoenix, AZ 85001',
                'joining_date' => '2024-04-05',
                'salary' => 60000.00
            ]
        ];

        echo "Creating 5 test employees...\n\n";

        foreach ($testEmployees as $index => $employeeData) {
            // Check if user already exists
            $existingUser = User::where('email', $employeeData['email'])->first();
            
            if ($existingUser) {
                // Update existing user
                $existingUser->update([
                    'password' => Hash::make($employeeData['password']),
                    'email_verified_at' => now(),
                    'password_changed_at' => now(),
                ]);
                
                // Update or create profile
                $existingUser->employeeProfile()->updateOrCreate(
                    ['user_id' => $existingUser->id],
                    [
                        'phone' => $employeeData['phone'],
                        'address' => $employeeData['address'],
                        'department' => $employeeData['department'],
                        'designation' => $employeeData['designation'],
                        'joining_date' => $employeeData['joining_date'],
                        'salary' => $employeeData['salary'],
                    ]
                );
                
                $user = $existingUser;
                $employeeId = $user->employee_id;
                echo "✓ Updated: {$employeeData['name']}\n";
            } else {
                // Parse name for employee ID generation
                $nameParts = EmployeeIdGenerator::parseName($employeeData['name']);
                
                // Generate employee ID
                $employeeId = EmployeeIdGenerator::generate(
                    $nameParts['firstName'],
                    $nameParts['lastName'],
                    'HRMS', // Company name
                    $employeeData['joining_date']
                );

                // Ensure uniqueness
                $originalEmployeeId = $employeeId;
                $counter = 1;
                while (User::where('employee_id', $employeeId)->exists()) {
                    $base = substr($originalEmployeeId, 0, -4);
                    $serial = str_pad((intval(substr($originalEmployeeId, -4)) + $counter), 4, '0', STR_PAD_LEFT);
                    $employeeId = $base . $serial;
                    $counter++;
                    
                    if ($counter > 9999) {
                        throw new \Exception('Unable to generate unique employee ID.');
                    }
                }

                // Create user
                $user = User::create([
                    'employee_id' => $employeeId,
                    'name' => $employeeData['name'],
                    'email' => $employeeData['email'],
                    'password' => Hash::make($employeeData['password']),
                    'role' => 'employee',
                    'email_verified_at' => now(), // Auto-verify for direct login
                    'password_changed_at' => now(), // Mark password as changed so they can login directly
                ]);

                // Create employee profile
                $user->employeeProfile()->create([
                    'phone' => $employeeData['phone'],
                    'address' => $employeeData['address'],
                    'department' => $employeeData['department'],
                    'designation' => $employeeData['designation'],
                    'joining_date' => $employeeData['joining_date'],
                    'salary' => $employeeData['salary'],
                ]);
                
                echo "✓ Created: {$employeeData['name']}\n";
            }

            echo "✓ Created: {$employeeData['name']}\n";
            echo "  Employee ID: {$employeeId}\n";
            echo "  Email: {$employeeData['email']}\n";
            echo "  Password: {$employeeData['password']}\n";
            echo "  Department: {$employeeData['department']}\n";
            echo "  Designation: {$employeeData['designation']}\n\n";
        }

        echo "\n==========================================\n";
        echo "TEST EMPLOYEES LOGIN CREDENTIALS\n";
        echo "==========================================\n\n";
        echo "All employees use the same password: Test@1234\n\n";
        
        foreach ($testEmployees as $employee) {
            $nameParts = EmployeeIdGenerator::parseName($employee['name']);
            $employeeId = EmployeeIdGenerator::generate(
                $nameParts['firstName'],
                $nameParts['lastName'],
                'HRMS',
                $employee['joining_date']
            );
            
            // Get actual employee ID from database
            $user = User::where('email', $employee['email'])->first();
            if ($user) {
                echo "Employee: {$employee['name']}\n";
                echo "  Login ID: {$user->employee_id} or {$employee['email']}\n";
                echo "  Password: Test@1234\n";
                echo "  Department: {$employee['department']}\n\n";
            }
        }
        
        echo "==========================================\n";
        echo "You can login using either Employee ID or Email\n";
        echo "==========================================\n";
    }
}
