# Database Migrations & Models Created ✅

## Summary

All MySQL migrations and Eloquent models have been created for the Dayflow HRMS system.

---

## 📋 Migrations Created

### 1. Users Table Updates

#### `2024_01_01_000002_add_employee_id_to_users_table.php`
- Adds `employee_id` field (unique, string)
- Positioned after `id` field

#### `2024_01_01_000003_update_role_enum_in_users_table.php`
- Updates role enum from `['employee', 'hr', 'admin']` to `['admin', 'employee']`
- Migrates any existing 'hr' roles to 'employee'
- Sets default to 'employee'

**Final Users Table Structure:**
```sql
- id (bigint, primary key)
- employee_id (string, unique)
- name (string)
- email (string, unique)
- password (string)
- role (enum: 'admin', 'employee', default: 'employee')
- email_verified_at (timestamp, nullable)
- remember_token (string, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

---

### 2. Employee Profiles Table

#### `2024_01_01_000010_create_employee_profiles_table.php`

**Fields:**
- `id` (bigint, primary key)
- `user_id` (foreign key → users.id, cascade delete)
- `phone` (string, nullable)
- `address` (text, nullable)
- `department` (string, nullable)
- `designation` (string, nullable)
- `joining_date` (date, nullable)
- `salary` (decimal 10,2, nullable)
- `profile_photo` (string, nullable)
- `documents` (JSON, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Indexes:**
- `user_id` (index)
- `department` (index)
- `designation` (index)

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

---

### 3. Attendances Table

#### `2024_01_01_000020_create_attendances_table.php`

**Fields:**
- `id` (bigint, primary key)
- `user_id` (foreign key → users.id, cascade delete)
- `date` (date)
- `check_in` (time, nullable)
- `check_out` (time, nullable)
- `status` (enum: 'present', 'absent', 'half_day', 'leave', default: 'absent')
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Indexes:**
- `user_id` (index)
- `date` (index)
- `status` (index)
- `user_id + date` (composite index)

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

---

### 4. Leaves Table

#### `2024_01_01_000030_create_leaves_table.php`

**Fields:**
- `id` (bigint, primary key)
- `user_id` (foreign key → users.id, cascade delete)
- `type` (enum: 'paid', 'sick', 'unpaid', default: 'unpaid')
- `from_date` (date)
- `to_date` (date)
- `reason` (text, nullable)
- `status` (enum: 'pending', 'approved', 'rejected', default: 'pending')
- `admin_comment` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Indexes:**
- `user_id` (index)
- `type` (index)
- `status` (index)
- `from_date` (index)
- `to_date` (index)
- `user_id + status` (composite index)

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

---

### 5. Payrolls Table

#### `2024_01_01_000040_create_payrolls_table.php`

**Fields:**
- `id` (bigint, primary key)
- `user_id` (foreign key → users.id, cascade delete)
- `basic` (decimal 10,2, default: 0)
- `allowances` (decimal 10,2, default: 0)
- `deductions` (decimal 10,2, default: 0)
- `net_salary` (decimal 10,2, default: 0)
- `month` (tinyInteger, 1-12)
- `year` (year)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Indexes:**
- `user_id` (index)
- `month` (index)
- `year` (index)
- `user_id + month + year` (composite index)

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

---

## 📦 Models Created

### 1. User Model (`backend/app/Models/User.php`)
- ✅ Updated `$fillable` to include `employee_id`
- ✅ Added relationships:
  - `employeeProfile()` - hasOne
  - `attendances()` - hasMany
  - `leaves()` - hasMany
  - `payrolls()` - hasMany

### 2. EmployeeProfile Model (`backend/app/Models/EmployeeProfile.php`)
- ✅ Table: `employee_profiles`
- ✅ Relationships: `belongsTo(User::class)`
- ✅ Casts: `joining_date` → date, `salary` → decimal, `documents` → array

### 3. Attendance Model (`backend/app/Models/Attendance.php`)
- ✅ Table: `attendances`
- ✅ Relationships: `belongsTo(User::class)`
- ✅ Casts: `date` → date, `check_in/check_out` → time

### 4. Leave Model (`backend/app/Models/Leave.php`)
- ✅ Table: `leaves`
- ✅ Relationships: `belongsTo(User::class)`
- ✅ Casts: `from_date/to_date` → date

### 5. Payroll Model (`backend/app/Models/Payroll.php`)
- ✅ Table: `payrolls`
- ✅ Relationships: `belongsTo(User::class)`
- ✅ Casts: All salary fields → decimal:2, `month/year` → integer

---

## 🔑 Key Features

### Foreign Keys
- All foreign keys properly defined with `onDelete('cascade')`
- Ensures data integrity when users are deleted

### Indexes
- Single column indexes on frequently queried fields
- Composite indexes for common query patterns:
  - `attendances(user_id, date)` - Quick attendance lookup
  - `leaves(user_id, status)` - Filter user leaves by status
  - `payrolls(user_id, month, year)` - Monthly payroll lookup

### Enum Constraints
- **users.role**: `['admin', 'employee']`
- **attendances.status**: `['present', 'absent', 'half_day', 'leave']`
- **leaves.type**: `['paid', 'sick', 'unpaid']`
- **leaves.status**: `['pending', 'approved', 'rejected']`

### Data Types
- Decimal fields: `decimal(10, 2)` for monetary values
- Date fields: Proper date casting
- JSON field: `documents` for flexible document storage
- Time fields: `time` for check-in/check-out

---

## 🚀 Next Steps

### 1. Run Migrations
```bash
cd backend
php artisan migrate
```

### 2. Verify Migration Status
```bash
php artisan migrate:status
```

### 3. Check Database Structure
```bash
php artisan tinker
>>> Schema::hasTable('users')
>>> Schema::hasTable('employee_profiles')
>>> Schema::hasTable('attendances')
>>> Schema::hasTable('leaves')
>>> Schema::hasTable('payrolls')
```

### 4. Test Models
```bash
php artisan tinker
>>> User::first()
>>> EmployeeProfile::first()
>>> Attendance::first()
>>> Leave::first()
>>> Payroll::first()
```

---

## 📝 Migration Order

Migrations will run in this order:
1. `2014_10_12_000000_create_users_table.php` (existing)
2. `2019_08_19_000000_create_personal_access_tokens_table.php` (existing)
3. `2024_01_01_000001_add_role_to_users_table.php` (existing)
4. `2024_01_01_000002_add_employee_id_to_users_table.php` ✨ NEW
5. `2024_01_01_000003_update_role_enum_in_users_table.php` ✨ NEW
6. `2024_01_01_000010_create_employee_profiles_table.php` ✨ NEW
7. `2024_01_01_000020_create_attendances_table.php` ✨ NEW
8. `2024_01_01_000030_create_leaves_table.php` ✨ NEW
9. `2024_01_01_000040_create_payrolls_table.php` ✨ NEW

---

## ⚠️ Important Notes

1. **Employee ID**: Required unique field. You'll need to handle generation logic in registration.
2. **Role Enum**: Changed from 3 roles to 2. Any existing 'hr' users will be migrated to 'employee'.
3. **Cascade Deletes**: Deleting a user will automatically delete related records in all tables.
4. **JSON Documents**: Store array of document paths/metadata in `employee_profiles.documents`.
5. **Salary Fields**: Using `decimal(10,2)` for precision in monetary calculations.

---

## ✅ Checklist

- [x] Users table updated with employee_id
- [x] Role enum updated (admin, employee only)
- [x] Employee profiles table created
- [x] Attendances table created
- [x] Leaves table created
- [x] Payrolls table created
- [x] All foreign keys defined
- [x] All indexes created
- [x] All enum constraints set
- [x] All models created with relationships
- [x] Proper data type casting in models
- [x] No linting errors

---

**Status**: ✅ **All migrations and models created successfully**

**Ready for**: Database migration and feature implementation

