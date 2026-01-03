# Test Employees Login Credentials

## All employees use the same password: **Test@1234**

You can login using either **Employee ID** or **Email Address**.

---

## Employee 1: John Smith
- **Employee ID:** HRJOSM20240001
- **Email:** john.smith@test.com
- **Password:** Test@1234
- **Department:** Engineering
- **Designation:** Senior Software Engineer
- **Phone:** +1-555-0101
- **Salary:** $75,000.00

---

## Employee 2: Sarah Johnson
- **Employee ID:** HRSAJO20240001
- **Email:** sarah.johnson@test.com
- **Password:** Test@1234
- **Department:** Marketing
- **Designation:** Marketing Manager
- **Phone:** +1-555-0102
- **Salary:** $65,000.00

---

## Employee 3: Michael Chen
- **Employee ID:** HRMICH20240001
- **Email:** michael.chen@test.com
- **Password:** Test@1234
- **Department:** Sales
- **Designation:** Sales Executive
- **Phone:** +1-555-0103
- **Salary:** $55,000.00

---

## Employee 4: Emily Davis
- **Employee ID:** HREMDA20240001
- **Email:** emily.davis@test.com
- **Password:** Test@1234
- **Department:** HR
- **Designation:** HR Manager
- **Phone:** +1-555-0104
- **Salary:** $70,000.00

---

## Employee 5: David Wilson
- **Employee ID:** HRDAWI20240001
- **Email:** david.wilson@test.com
- **Password:** Test@1234
- **Department:** Finance
- **Designation:** Financial Analyst
- **Phone:** +1-555-0105
- **Salary:** $60,000.00

---

## How to Login

1. Go to the employee login page: `/login`
2. Enter either:
   - Employee ID (e.g., `HRJOSM20240001`)
   - OR Email address (e.g., `john.smith@test.com`)
3. Enter password: `Test@1234`
4. Click "Sign In"

**Note:** All employees are pre-verified and can login directly without email verification.

---

## To Re-seed Test Employees

Run the following command:
```bash
cd backend
php artisan db:seed --class=TestEmployeesSeeder
```

This will update existing employees or create new ones if they don't exist.

