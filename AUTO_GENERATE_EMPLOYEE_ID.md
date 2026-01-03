# Auto-Generate Employee/Login ID System ✅

## Summary

The system now automatically generates Employee/Login IDs based on a specific format when users are registered.

---

## 📋 Format Specification

### Format Structure:
```
[Company Code][First 2 letters of First Name][First 2 letters of Last Name][Year of Joining][Serial Number]
```

### Example:
```
OIJODO20220001
```

### Breakdown:
- **OI** → Company Code (Odoo India)
- **JO** → First 2 letters of first name (Jo)
- **DO** → First 2 letters of last name (Do)
- **2022** → Year of Joining
- **0001** → Serial Number (4 digits, zero-padded)

---

## 🔧 Implementation

### Service Class Created

**File**: `backend/app/Services/EmployeeIdGenerator.php`

#### Main Method:
```php
EmployeeIdGenerator::generate(
    string $firstName,
    string $lastName,
    ?string $companyName = null,
    ?string $joiningDate = null
): string
```

#### Features:
1. **Company Code Generation**:
   - Extracts first 2 letters from company name (if provided)
   - Defaults to `COMPANY_CODE` env variable or "OI"
   - Automatically uppercased

2. **Name Parsing**:
   - Splits full name into first name and last name
   - Handles single-word names (uses same for both)
   - Handles multiple-word last names

3. **Year Extraction**:
   - Uses joining date if provided
   - Defaults to current year
   - Format: YYYY (4 digits)

4. **Serial Number**:
   - Auto-increments based on existing employees
   - Scans all employee IDs for matching company code and year
   - Formats as 4-digit zero-padded number (0001, 0002, etc.)
   - Handles collisions by incrementing

---

## ✅ Changes Made

### Backend

1. **Created Service Class**:
   - `backend/app/Services/EmployeeIdGenerator.php`
   - Handles all ID generation logic
   - Includes collision detection and resolution

2. **Updated AuthController**:
   - Removed `employee_id` from validation (no longer required)
   - Auto-generates employee_id before user creation
   - Handles uniqueness checks
   - Supports company name from request

3. **Name Parsing**:
   - Automatically splits full name into first/last name
   - Handles edge cases (single name, multiple last names)

### Frontend

1. **Signup Form**:
   - Removed employee_id input field
   - Company name field used for company code generation
   - Employee ID shown to user after successful registration

---

## 📝 Usage Examples

### Example 1: Basic Registration
```php
// User: "John Doe"
// Company: "Odoo India"
// Year: 2024
// Result: OIJODO20240001
```

### Example 2: Multiple Employees Same Year
```php
// Employee 1: "John Doe" → OIJODO20240001
// Employee 2: "Jane Smith" → OIJASM20240002
// Employee 3: "John Doe" (different person) → OIJODO20240003
```

### Example 3: Different Company
```php
// Company: "Tech Solutions"
// User: "John Doe"
// Result: TEJODO20240001
```

### Example 4: Single Word Name
```php
// User: "Madonna"
// Result: OIMAMA20240001 (uses "Ma" for both first and last)
```

---

## 🔐 Logic Details

### Company Code Generation
```php
// From "Odoo India" → "OI"
// From "Tech Solutions Inc" → "TE"
// Default: env('COMPANY_CODE', 'OI')
```

### Name Code Generation
```php
// "John" → "JO"
// "Doe" → "DO"
// "Mary-Jane" → "MA" (takes first 2 letters)
// "O'" → "OX" (padded with X if less than 2 chars)
```

### Serial Number Logic
```sql
-- Finds all employee IDs matching pattern:
SELECT employee_id FROM users 
WHERE employee_id LIKE 'OI____2024%'
ORDER BY employee_id DESC
LIMIT 1

-- Extracts last 4 digits and increments
```

### Collision Handling
- If generated ID exists, increments serial number
- Max attempts: 9999 (prevents infinite loop)
- Logs warning if collision occurs

---

## ⚙️ Configuration

### Environment Variable (Optional)
Add to `.env`:
```env
COMPANY_CODE=OI
```

If not set, defaults to "OI".

### Joining Date (Future Enhancement)
Currently uses current year. Can be enhanced to:
```php
// In EmployeeProfile model
$joiningDate = $employeeProfile->joining_date;
$employeeId = EmployeeIdGenerator::generate(
    $firstName,
    $lastName,
    $companyName,
    $joiningDate
);
```

---

## 🧪 Testing Examples

### Test Case 1: Basic Generation
```php
$id = EmployeeIdGenerator::generate('John', 'Doe', 'Odoo India');
// Expected: OIJODO20240001 (or current year)
```

### Test Case 2: Name Parsing
```php
$name = EmployeeIdGenerator::parseName('John Michael Doe');
// Returns: ['firstName' => 'John', 'lastName' => 'Michael Doe']
```

### Test Case 3: Serial Increment
```php
// First user: OIJODO20240001
// Second user (same company, same year): OIJODO20240002
```

---

## 📊 Database Impact

### Before:
- Users manually entered employee_id
- Risk of duplicates
- No standardized format

### After:
- System auto-generates unique IDs
- Standardized format
- Automatic serial numbering
- Collision detection

---

## 🚀 API Response

### Registration Response:
```json
{
  "status": true,
  "message": "User registered successfully",
  "token": "1|xxxxxxxxxxxx",
  "user": {
    "id": 1,
    "employee_id": "OIJODO20240001",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee"
  }
}
```

---

## ⚠️ Important Notes

1. **Uniqueness**: System ensures uniqueness automatically
2. **Case Sensitivity**: All codes are uppercase
3. **Name Handling**: Handles various name formats (single, multiple words, special characters)
4. **Serial Reset**: Serial numbers reset each year (per company)
5. **Collision Safety**: Built-in collision detection and resolution

---

## 🔄 Migration Path

### For Existing Users:
If you have existing users without employee_ids:

```php
// Migration script (run once)
$users = User::whereNull('employee_id')->get();
foreach ($users as $user) {
    $nameParts = EmployeeIdGenerator::parseName($user->name);
    $user->employee_id = EmployeeIdGenerator::generate(
        $nameParts['firstName'],
        $nameParts['lastName'],
        null,
        $user->created_at
    );
    $user->save();
}
```

---

## ✅ Checklist

- [x] Service class created
- [x] Name parsing implemented
- [x] Company code extraction
- [x] Year extraction
- [x] Serial number generation
- [x] Collision detection
- [x] AuthController updated
- [x] Frontend form updated
- [x] Documentation created

---

**Implementation Date**: Current  
**Status**: ✅ **Auto-generation system implemented and ready**  
**Format**: `[COMPANY_CODE][FIRST2][LAST2][YEAR][SERIAL]`


