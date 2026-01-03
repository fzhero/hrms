# Wireframe Design Review - Page-by-Page Analysis

## Overview
This document provides a comprehensive review of each page/screen in the HRMS wireframes, including design specifications, validation requirements, and important implementation notes.

---

## 📄 Page 1: Authentication Pages

### 1.1 Login Page

#### Design Elements:
- **Header**: "Human Resource Management System" title
- **Form Fields**:
  - Email/Username input field
  - Password input field (masked)
- **Actions**:
  - "Login" button (primary action)
  - "Forgot Password?" link
  - "Don't have an account? Sign Up" link

#### ⚠️ Important Design Notes:

1. **Dual Input Type (Email/Username)**
   - Field label: "Email/Username" indicates users can login with either
   - **Implementation Note**: Backend must support both email and username lookup
   - **Validation**: 
     - If email format → validate as email
     - If not email format → validate as username/Employee ID

2. **Forgot Password Link**
   - Visible and accessible
   - Should be clickable, not just decorative
   - **Implementation**: Must redirect to password reset flow

3. **Navigation Flow**
   - "Sign Up" link should be prominent
   - After successful login → redirect to Dashboard
   - After failed login → stay on page, show error message

#### 🎨 UI/UX Considerations:

- **Error Handling**: Display error messages clearly (e.g., "Invalid credentials")
- **Loading State**: Show loading indicator on button during authentication
- **Accessibility**: 
  - Form fields should have proper labels
  - Keyboard navigation support
  - Focus indicators visible

#### ✅ Validation Requirements:

```
Email/Username:
  - Required field
  - Cannot be empty
  - If email format: validate email pattern
  - If not email: validate as Employee ID format

Password:
  - Required field
  - Minimum 8 characters (as per signup rules)
  - Display strength indicator? (optional enhancement)

Error Messages:
  - "Email/Username is required"
  - "Password is required"
  - "Invalid credentials" (for wrong email/password combination)
  - "Account not verified. Please check your email"
  - "Account is inactive. Please contact administrator"
```

#### 🔐 Security Considerations:

- Password field must be masked (type="password")
- Implement rate limiting (prevent brute force attacks)
- Show generic error message (don't reveal if email exists or not)
- Session timeout after inactivity

---

### 1.2 Sign Up Page

#### Design Elements:
- **Form Fields**:
  - Employee ID input
  - Email input
  - Password input (masked)
  - Confirm Password input (masked)
  - Role dropdown (Employee, HR)

#### ⚠️ Critical Design Notes:

1. **Role Dropdown Visibility**
   - **CRITICAL**: "Role dropdown should be visible only to Admin"
   - **Design Conflict**: If this is the signup page, how can Admin see it?
   - **Clarification Needed**: 
     - Is signup public? (then role should default to "Employee")
     - Or is signup only accessible by Admin? (then Admin creates accounts)
   - **Recommended Solution**: 
     - Public signup → Hide role dropdown, default to "Employee"
     - Admin signup → Show role dropdown, allow selection

2. **Password Requirements**
   - Must display password requirements clearly:
     - At least 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one number
     - At least one special character
   - **Best Practice**: Show real-time validation feedback

3. **Email Verification Flow**
   - "Email verification is required"
   - After signup → redirect to login (not dashboard)
   - User must verify email before first login

#### 🎨 UI/UX Considerations:

- **Password Strength Indicator**: Visual feedback (weak/medium/strong)
- **Real-time Validation**: Show errors as user types (after blur event)
- **Password Visibility Toggle**: Optional eye icon to show/hide password
- **Role Dropdown**: 
  - If visible → default to "Employee"
  - If Admin only → show all roles (Employee, HR, Admin?)

#### ✅ Validation Requirements:

```
Employee ID:
  - Required
  - Unique (check against database)
  - Format: [PATTERN TBD - e.g., EMP001, EMP-001]
  - Validation: Must not exist already
  - Error: "Employee ID already exists" or "Invalid Employee ID format"

Email:
  - Required
  - Valid email format (regex validation)
  - Unique (check against database)
  - Case-insensitive
  - Error: "Email is required" / "Invalid email format" / "Email already registered"

Password:
  - Required
  - Minimum 8 characters
  - Must contain:
    ✓ At least 1 uppercase letter (A-Z)
    ✓ At least 1 lowercase letter (a-z)
    ✓ At least 1 number (0-9)
    ✓ At least 1 special character (!@#$%^&*)
  - Real-time validation feedback
  - Error: "Password must be at least 8 characters with uppercase, lowercase, number, and special character"

Confirm Password:
  - Required
  - Must match Password field exactly
  - Real-time validation (check on blur/change)
  - Error: "Passwords do not match"

Role:
  - Required (if dropdown is visible)
  - Must be valid option: "Employee" or "HR"
  - Default: "Employee" (if visible to all)
  - Error: "Please select a role"
```

#### 🔄 Post-Submit Flow:

1. Validate all fields
2. Create user account (status: unverified)
3. Send verification email
4. Show success message: "Account created! Please check your email to verify your account."
5. Redirect to Login page
6. **Do NOT** auto-login after signup

---

## 📄 Page 2: Dashboard (Main Landing Page)

### 2.1 Dashboard Layout

#### Design Elements:
- **Header Section**:
  - System title: "Human Resource Management System"
  - User profile picture (avatar) in top-right corner
- **Main Content**:
  - Grid of Employee Cards
  - Each card: Profile picture, Name, "View Profile" button
- **Attendance Widget**:
  - Small box with "Check In" and "Check Out" buttons
  - Status indicator dot (red/green)

#### ⚠️ Critical Design Notes:

1. **User Profile Dropdown**
   - **Interaction**: Click avatar → dropdown menu appears
   - **Menu Options**:
     - "My Profile" (links to profile page)
     - "Log Out" (logs out user)
   - **Design**: Dropdown should overlay below avatar, not push content
   - **State**: Close dropdown on outside click or menu item selection

2. **Employee Cards**
   - **Grid Layout**: Responsive grid (3-4 columns on desktop, 2 on tablet, 1 on mobile)
   - **Card Design**:
     - Profile picture (circular or square, with default placeholder)
     - Employee name (truncate if too long)
     - "View Profile" button
   - **Interactivity**:
     - **CRITICAL**: "Make these cards clickable"
     - Entire card is clickable (not just button)
     - Hover effect (subtle shadow/scale)
   - **View Modes**:
     - Click opens employee profile
     - **Read-only mode**: For employees viewing other employees
     - **Editable mode**: For Admin/HR viewing employees

3. **Role-Based Visibility**
   - **Employees**: Should only see their own card? Or all employees?
   - **Wireframe shows all employees** → Employees can view other employees' profiles (read-only)
   - **Admin/HR**: Can edit any employee profile

4. **Attendance Check-In/Check-Out Widget**
   - **Location**: Prominent placement (always visible)
   - **Buttons**:
     - "Check In" (primary, enabled when not checked in)
     - "Check Out" (secondary, enabled after check in)
   - **Status Indicator**:
     - Red dot = Not checked in / Absent
     - Green dot = Checked in / Present
     - **State Change**: "Upon successful Check In, the red status dot changes to green"
   - **Functionality**:
     - Employees can mark attendance
     - Check In → Record timestamp + location
     - Check Out → Record timestamp + location, calculate hours
   - **Visibility**: Should be visible to all employees, hidden for Admin/HR? (TBD)

#### 🎨 UI/UX Considerations:

- **Search Functionality**: 
  - Search bar above employee cards
  - Filter by name, Employee ID, department
  - Real-time search (as user types)

- **Pagination**: 
  - If many employees, paginate cards
  - Show 12-20 cards per page
  - Page numbers or "Load More" button

- **Empty States**:
  - No employees: "No employees found"
  - No search results: "No employees match your search"

- **Loading States**:
  - Skeleton cards while loading
  - Loading spinner on attendance buttons during API call

- **Responsive Design**:
  - Desktop: 4 columns
  - Tablet: 2-3 columns
  - Mobile: 1 column

#### ✅ Validation Requirements:

```
Employee Card Click:
  - Verify employee exists
  - Check user permissions (can view this employee?)
  - Load employee data

Check In:
  - Verify user is authenticated
  - Verify user is Active (not suspended)
  - Check if already checked in today (prevent duplicate)
  - Get location (GPS or manual entry)
  - Record timestamp
  - Update status indicator to green

Check Out:
  - Verify user has checked in today
  - Prevent double check-out
  - Get location
  - Record timestamp
  - Calculate working hours
  - Update status indicator (keep green or change?)

Status Indicator:
  - Red: No check-in today OR no check-in record
  - Green: Checked in today AND not checked out
  - Update in real-time after check-in/out
```

#### 🔐 Security & Permissions:

- **View Permissions**:
  - All authenticated users can view employee cards
  - Clicking card → View profile (read-only for employees, editable for Admin/HR)
- **Attendance Permissions**:
  - Only employees can check in/out (not Admin/HR?)
  - Or Admin/HR can also check in/out for themselves?

---

## 📄 Page 3: User Profile & Salary Information

### 3.1 Profile Page Layout

#### Design Elements:
- **Header**: Greeting (e.g., "Hi Adam")
- **Navigation Tabs**:
  - "My Profile"
  - "Attendance"
  - "Time Off"
  - "Salary Info" (Admin only)
- **Profile Picture Section**: Upload/change picture
- **Form Fields**: Personal and job information

#### ⚠️ Critical Design Notes:

1. **Tab Navigation**
   - Active tab highlighted (underline or background color)
   - Smooth transition between tabs
   - Persist data when switching tabs (don't lose unsaved changes)
   - **Salary Info Tab**: Hidden for non-Admin users (conditional rendering)

2. **Profile Picture**
   - **Display**: Circular or square image with default placeholder
   - **Upload**:
     - Click picture → file picker opens
     - Accept: JPG, PNG, JPEG
     - Max size: 2MB (recommended)
     - Auto-crop/resize to square (e.g., 200x200px)
   - **Preview**: Show preview before upload
   - **Change**: "Change Picture" button or click to change
   - **Permissions**: All users can change their own picture

3. **Form Fields Structure**

#### My Profile Tab Fields:

```
Personal Information:
- My Name (First Name + Last Name?)
- Employee ID (read-only, cannot edit)
- Email (editable by Admin only)
- Phone Number (editable by Employee)
- Address (editable by Employee)
- Date of Birth (format: DD/MM/YYYY or calendar picker)

Job Information:
- Role (read-only, displayed only)
- Department (read-only for Employee, editable by Admin)
- Designation (read-only for Employee, editable by Admin)
- Joining Date (read-only, cannot edit)

Documents Section:
- List of uploaded documents
- Upload button (Admin/HR can upload, Employees can only view)
- View/Download options
- Delete option (Admin/HR only)
```

4. **Edit Mode vs View Mode**
   - **View Mode** (default): All fields read-only
   - **Edit Mode**: 
     - Toggle button: "Edit Profile" → "Save Changes" / "Cancel"
     - Editable fields become inputs
     - Save → Validate → Update → Show success message

5. **Field Permissions** (Based on Wireframe Notes):

**Employee Can Edit:**
- Phone Number
- Address
- Profile Picture
- **Cannot Edit**: Name, Employee ID, Email, Role, Department, Designation, Joining Date

**Admin/HR Can Edit:**
- All fields
- Can upload documents
- Can delete documents

#### ✅ Validation Requirements - Profile Fields:

```
My Name:
  - Required
  - Minimum 2 characters
  - Maximum 50 characters
  - Only letters and spaces
  - Error: "Name must be 2-50 characters, letters only"

Employee ID:
  - Read-only (cannot edit)
  - Display format: [PATTERN]

Email:
  - Required
  - Valid email format
  - Unique (if editing)
  - Employee: Read-only
  - Admin: Editable
  - Error: "Invalid email format" / "Email already exists"

Phone Number:
  - Required
  - Format: [PATTERN TBD - e.g., +1-234-567-8900 or 10 digits]
  - Valid phone number
  - Error: "Invalid phone number format"

Address:
  - Required
  - Minimum 10 characters
  - Maximum 500 characters
  - Error: "Address must be 10-500 characters"

Date of Birth:
  - Required
  - Valid date format (YYYY-MM-DD or DD/MM/YYYY)
  - Must be in the past
  - Minimum age: 18 years (or company policy)
  - Error: "Invalid date" / "Must be at least 18 years old"

Joining Date:
  - Read-only (cannot edit)
  - Display format: DD/MM/YYYY

Role:
  - Read-only (display only)
  - Options: Employee, HR, Admin

Department:
  - Required
  - Must be valid department (dropdown)
  - Employee: Read-only
  - Admin: Editable
  - Error: "Please select a department"

Designation:
  - Required
  - Must be valid designation (dropdown)
  - Employee: Read-only
  - Admin: Editable
  - Error: "Please select a designation"

Profile Picture:
  - Optional
  - File types: JPG, PNG, JPEG
  - Max size: 2MB
  - Dimensions: Square recommended (200x200px)
  - Auto-resize on upload
  - Error: "File must be JPG, PNG, or JPEG, max 2MB"

Documents:
  - Max files: 10 (recommended)
  - Max size per file: 5MB
  - File types: PDF, DOC, DOCX, JPG, PNG
  - Required fields: Document name, Document type
  - Error: "File size exceeds 5MB" / "Invalid file type"
```

#### 🎨 UI/UX Considerations:

- **Form Layout**: 
  - Two-column layout on desktop (personal info left, job info right)
  - Single column on mobile
  - Clear section headers

- **Field States**:
  - Read-only fields: Grayed out or with lock icon
  - Editable fields: Clear input borders
  - Required fields: Asterisk (*) or "Required" label

- **Save/Cancel Actions**:
  - "Save Changes" button (primary, green)
  - "Cancel" button (secondary, gray)
  - Confirmation dialog if unsaved changes

- **Success/Error Messages**:
  - Toast notification or inline message
  - "Profile updated successfully" / "Failed to update profile"

- **Documents Section**:
  - List view with document icons
  - "Upload Document" button (if permitted)
  - View/Download icons
  - Delete icon (Admin/HR only, with confirmation)

---

### 3.2 Salary Info Tab

#### Design Elements:
- **Visibility**: Only visible to Admin users
- **Fields**:
  - Basic Salary
  - House Rent Allowance (HRA)
  - Medical Allowance
  - Conveyance Allowance
  - Special Allowance
  - Gross Salary (calculated, read-only)
  - Provident Fund (PF)
  - Professional Tax (PT)
  - Net Salary (calculated, read-only)
- **Action**: "Update Salary Structure" button

#### ⚠️ Critical Design Notes:

1. **Role-Based Visibility**
   - **CRITICAL**: "Salary Info Tab Should only be visible to Admin"
   - Hide tab completely for non-Admin users
   - Employees should NOT see this tab at all

2. **Calculation Fields**
   - **Gross Salary**: Auto-calculated (sum of all allowances)
   - **Net Salary**: Auto-calculated (Gross - Deductions)
   - These fields should be read-only and highlighted (different background color)

3. **Update Button**
   - Only Admin can click and update
   - After update → Show success message
   - Update affects selected employee (not current user)

4. **Display for Employees**
   - Wireframe notes: "Read-only for employees"
   - But tab is hidden → Employees cannot see salary info
   - **Clarification Needed**: Should employees see salary info in a different section?

#### ✅ Validation Requirements - Salary Fields:

```
Basic Salary:
  - Required
  - Number (decimal, 2 decimal places)
  - Minimum: 10000 (or company minimum)
  - Maximum: 10000000 (reasonable maximum)
  - Format: Currency (₹, $, etc.)
  - Error: "Basic salary must be between ₹10,000 and ₹10,000,000"

House Rent Allowance (HRA):
  - Optional (or required? TBD)
  - Number (decimal, 2 decimal places)
  - Minimum: 0
  - Maximum: Can be percentage or fixed amount
  - Error: "HRA must be a positive number"

Medical Allowance:
  - Optional
  - Number (decimal, 2 decimal places)
  - Minimum: 0
  - Error: "Medical allowance must be a positive number"

Conveyance Allowance:
  - Optional
  - Number (decimal, 2 decimal places)
  - Minimum: 0
  - Error: "Conveyance allowance must be a positive number"

Special Allowance:
  - Optional
  - Number (decimal, 2 decimal places)
  - Minimum: 0
  - Error: "Special allowance must be a positive number"

Gross Salary (Auto-calculated):
  - Formula: Basic + HRA + Medical + Conveyance + Special
  - Read-only
  - Display in currency format
  - Highlighted background (e.g., light blue)

Provident Fund (PF):
  - Optional (or auto-calculated? TBD)
  - Number (decimal, 2 decimal places)
  - Usually 12% of Basic Salary (can be auto-calculated)
  - Minimum: 0
  - Error: "PF must be a positive number"

Professional Tax (PT):
  - Optional (or auto-calculated? TBD)
  - Number (decimal, 2 decimal places)
  - Fixed amount or state-based calculation
  - Minimum: 0
  - Error: "PT must be a positive number"

Net Salary (Auto-calculated):
  - Formula: Gross - PF - PT
  - Read-only
  - Display in currency format
  - Highlighted background (e.g., light green)
  - Must be positive (warn if negative)
```

#### 🎨 UI/UX Considerations:

- **Field Grouping**:
  - Group 1: Earnings (Basic, HRA, Medical, Conveyance, Special)
  - Group 2: Gross Salary (calculated, highlighted)
  - Group 3: Deductions (PF, PT)
  - Group 4: Net Salary (calculated, highlighted)

- **Real-time Calculation**:
  - Update Gross and Net as user types
  - Show calculation formula (optional, in tooltip)

- **Currency Formatting**:
  - Display with currency symbol (₹, $)
  - Thousand separators (e.g., ₹50,000.00)
  - Two decimal places

- **Update Button**:
  - Primary action button
  - Show loading state during update
  - Confirmation dialog? (optional, for large changes)

---

## 📄 Page 4: Attendance Tracking

### 4.1 Attendance Table (Admin/HR View)

#### Design Elements:
- **Table Columns**:
  - Date
  - Day (e.g., Monday, Tuesday)
  - Check In (time)
  - Check Out (time)
  - Status (Present, Absent, Half-day, Leave)
  - Location
- **Filters**: Date range, employee selector
- **Actions**: Edit button (Admin/HR only), Export button

#### ⚠️ Critical Design Notes - Status Logic:

**CRITICAL BUSINESS RULES (from wireframe notes):**

1. **Leave Status**:
   - "If an employee is on leave, it should be marked as 'Leave'."
   - **Priority**: Leave status overrides check-in/check-out
   - Check: If employee has approved leave for that date → Status = "Leave"

2. **Half-Day Status**:
   - "If an employee checks in but does not check out, it should be marked as 'Half-day'."
   - Logic: Has check-in record BUT no check-out record → Status = "Half-day"
   - Alternative: Hours worked < 4 hours → Half-day

3. **Absent Status**:
   - "If an employee does not check in or out, it should be marked as 'Absent'."
   - Logic: No check-in record AND no approved leave → Status = "Absent"

4. **Present Status**:
   - Has check-in AND check-out records
   - Working hours >= minimum threshold (e.g., 4 hours)
   - No leave for that date

5. **Admin/HR Permissions**:
   - "The attendance records should be editable by Admin/HR."
   - "Admin/HR can view all employees' attendance records."
   - Edit button opens modal/form to update attendance

6. **Automatic Calculations**:
   - "The system should automatically calculate the total working hours for each employee."
   - Formula: Check-out time - Check-in time - Break time
   - Display in hours:minutes format (e.g., 8:30)

7. **Reporting Features**:
   - "The system should allow Admin/HR to generate attendance reports for a specific date range."
   - Date range picker
   - Report format: Table, PDF, Excel
   - "The system should allow Admin/HR to export attendance data."
   - Export button → Download CSV/Excel

#### ✅ Validation Requirements - Attendance:

```
Date:
  - Required
  - Valid date format
  - Cannot be future date (unless Admin override)
  - Error: "Invalid date" / "Date cannot be in the future"

Check In Time:
  - Optional (if Absent)
  - Required (if Present or Half-day)
  - Valid time format (HH:MM or HH:MM:SS)
  - Must be within working hours (e.g., 6 AM - 12 PM)
  - Error: "Invalid time format" / "Check-in time out of range"

Check Out Time:
  - Optional (if Half-day or Absent)
  - Required (if Present)
  - Must be after Check In Time
  - Valid time format
  - Error: "Check-out must be after check-in time"

Status:
  - Auto-calculated based on rules
  - Can be manually overridden by Admin/HR (with reason)
  - Options: Present, Absent, Half-day, Leave
  - Validation: If status is "Leave", must have approved leave record

Location:
  - Required for check-in/check-out
  - Format: Address string or GPS coordinates
  - Display: Truncate if too long, show full on hover
  - Error: "Location is required"

Working Hours:
  - Auto-calculated
  - Formula: (Check-out - Check-in) - Break time
  - Display: HH:MM format
  - Minimum: 0
  - Maximum: 24 (for edge cases)

Manual Edit (Admin/HR):
  - Reason required for manual entry/edit
  - Confirmation dialog before saving
  - Audit log: Who edited, when, what changed
```

#### 🎨 UI/UX Considerations:

- **Table Design**:
  - Sortable columns (click header to sort)
  - Pagination (20-50 records per page)
  - Filters: Employee dropdown, Date range picker
  - Search: Quick search by employee name

- **Status Indicators**:
  - Color coding:
    - Present: Green badge
    - Absent: Red badge
    - Half-day: Yellow/Orange badge
    - Leave: Blue badge
  - Icons optional (checkmark, X, clock, calendar)

- **Edit Functionality**:
  - Edit icon/button per row
  - Click → Modal/form opens
  - Fields: Date, Check In, Check Out, Status (dropdown), Location, Reason
  - Save/Cancel buttons

- **Export Functionality**:
  - "Export" button (top-right)
  - Options: Export Current View, Export Selected, Export Date Range
  - Formats: CSV, Excel, PDF
  - Include: All visible columns

- **Date Range Filter**:
  - Date picker: Start date and End date
  - Quick filters: Today, This Week, This Month, Last Month, Custom
  - Apply button

---

### 4.2 Attendance Table (Employee View)

#### Design Elements:
- **Similar table structure** but read-only
- **Columns**: Same as Admin view (Date, Day, Check In, Check Out, Status, Location)
- **No Edit button**: Employees cannot edit attendance
- **Filter**: Date range only (own records)

#### ⚠️ Important Design Notes:

1. **Read-Only Access**:
   - Employees can only view their own attendance
   - No edit functionality
   - Status is auto-calculated (same rules apply)

2. **Filter Scope**:
   - Only shows current employee's records
   - Date range filter to navigate periods

3. **Location Display**:
   - Show location where checked in/out
   - Useful for employees to verify attendance

#### ✅ Validation Requirements:

```
View Access:
  - Verify user can only see their own records
  - Filter automatically by user ID
  - Hide edit controls

Date Range:
  - Default: Current month
  - Allow navigation: Previous/Next month buttons
  - Custom date range picker
```

---

## 📄 Page 5: Time Off Management

### 5.1 Time Off List (Admin/HR View)

#### Design Elements:
- **Table Columns**:
  - Name (Employee name)
  - Start Date and End Date (combined or separate columns)
  - Time off Type (Paid Time Off, Sick Leave, Unpaid Leaves)
  - Status (Pending, Approved, Rejected)
  - Remarks (employee's reason)
  - Action (Approve/Reject buttons)
- **Filters**: Status, Date range, Employee, Type
- **Bulk Actions**: Bulk approve/reject (optional enhancement)

#### ⚠️ Critical Design Notes:

1. **Permissions**:
   - "Employees can view only their own time off records, while Admins and HR Officers can view time off records & approve/reject them for all employees."
   - Admin/HR can see ALL employee requests
   - Action buttons visible only to Admin/HR

2. **Action Buttons**:
   - "Approve" button (green/primary)
   - "Reject" button (red/secondary)
   - Both in same row (Action column)
   - Click → Confirmation dialog or inline approval

3. **Approval Flow**:
   - Click Approve → Status changes to "Approved"
   - Click Reject → Status changes to "Rejected" (may require comment)
   - Update leave balance (if Paid Time Off)
   - Send notification to employee (future enhancement)

4. **Status Display**:
   - Pending: Yellow/Orange badge
   - Approved: Green badge
   - Rejected: Red badge

#### ✅ Validation Requirements:

```
Approval Action:
  - Verify request exists
  - Verify request is in "Pending" status
  - Verify user has permission (Admin/HR)
  - On Approve:
    - Check leave balance (if Paid Time Off)
    - Update status to "Approved"
    - Deduct balance
    - Send notification

Rejection Action:
  - Verify request exists
  - Verify request is in "Pending" status
  - Verify user has permission (Admin/HR)
  - Optional: Require rejection reason/comment
  - On Reject:
    - Update status to "Rejected"
    - Do NOT deduct balance
    - Send notification

Status Filter:
  - Filter by: All, Pending, Approved, Rejected
  - Default: All or Pending

Date Range Filter:
  - Filter by request date or leave date range
  - Default: Current month or All
```

#### 🎨 UI/UX Considerations:

- **Table Design**:
  - Sortable columns
  - Pagination
  - Filters at top
  - Highlight pending requests (different background color)

- **Action Buttons**:
  - Inline buttons (not in dropdown)
  - Disable buttons if status is not "Pending"
  - Loading state during approval/rejection

- **Confirmation Dialogs**:
  - Approve: "Are you sure you want to approve this leave request?"
  - Reject: "Are you sure? Please provide a reason:" (textarea)

- **Bulk Actions** (Optional Enhancement):
  - Checkbox per row
  - "Bulk Approve" / "Bulk Reject" buttons
  - Confirmation dialog showing count

---

### 5.2 Time Off List (Employee View)

#### Design Elements:
- **Table Columns**:
  - Name (own name, or hide if only own records)
  - Start Date and End Date
  - Time off Type
  - Status
  - Remarks
- **No Action column**: Employees cannot approve/reject
- **Action Button**: "Request Time Off" button (prominent, top-right)

#### ⚠️ Important Design Notes:

1. **Own Records Only**:
   - Filter automatically by current user
   - Show only their own requests
   - No employee selector

2. **Request Button**:
   - Prominent placement (top-right or floating action button)
   - Click → Opens "New Time Off Request" modal/form

---

### 5.3 Time Off Request Form

#### Design Elements:
- **Form Fields**:
  - Employee (dropdown, pre-selected for employees, Admin can select)
  - Time Off Type (dropdown: Paid Time Off, Sick Leave, Unpaid Leaves)
  - Start Date (date picker)
  - End Date (date picker)
  - Reason (text area)
  - Remarks (text area, optional)
- **Buttons**: "Submit" (primary), "Cancel" (secondary)

#### ⚠️ Critical Design Notes:

1. **Employee Field**:
   - For Employees: Pre-filled, disabled (cannot change)
   - For Admin: Dropdown to select employee (for creating on behalf of employee)

2. **Date Range Validation**:
   - Start Date must be <= End Date
   - Cannot select past dates (unless Admin override)
   - Check for overlapping leave requests
   - Check leave balance (for Paid Time Off)

3. **Time Off Types**:
   - Paid Time Off: Requires balance check
   - Sick Leave: May have separate balance
   - Unpaid Leaves: No balance check

4. **Reason Field**:
   - Required or optional? (TBD, but recommended: Required)
   - Minimum length: 10 characters
   - Maximum length: 500 characters

5. **Submit Flow**:
   - Validate all fields
   - Check leave balance (if applicable)
   - Create request with status "Pending"
   - Show success message
   - Close modal, refresh list
   - Send notification to Admin/HR

#### ✅ Validation Requirements:

```
Employee:
  - Required (if Admin)
  - Pre-filled for employees (read-only)
  - Must be valid employee ID
  - Error: "Please select an employee"

Time Off Type:
  - Required
  - Must be valid type: "Paid Time Off", "Sick Leave", "Unpaid Leaves"
  - Error: "Please select a time off type"

Start Date:
  - Required
  - Valid date format
  - Cannot be in the past (unless Admin)
  - Minimum notice: 1 day in advance (or company policy)
  - Error: "Invalid date" / "Start date cannot be in the past" / "Please request at least 1 day in advance"

End Date:
  - Required
  - Valid date format
  - Must be >= Start Date
  - Cannot be more than 30 days after Start Date (or company policy)
  - Error: "End date must be after start date" / "Leave period cannot exceed 30 days"

Reason:
  - Required
  - Minimum 10 characters
  - Maximum 500 characters
  - Error: "Reason must be 10-500 characters"

Remarks:
  - Optional
  - Maximum 500 characters
  - Error: "Remarks must not exceed 500 characters"

Leave Balance Check (for Paid Time Off):
  - Calculate total days (excluding weekends? holidays?)
  - Check if balance >= requested days
  - Error: "Insufficient leave balance. Available: X days, Requested: Y days"

Overlap Check:
  - Check if dates overlap with existing approved/pending requests
  - Error: "You already have a leave request for these dates"
```

#### 🎨 UI/UX Considerations:

- **Modal Design**:
  - Centered modal overlay
  - Clear title: "Request Time Off"
  - Form fields with labels
  - Date pickers with calendar UI
  - Character counter for Reason/Remarks

- **Date Picker**:
  - Calendar view (click to open)
  - Disable past dates (unless Admin)
  - Highlight weekends (optional)
  - Show total days selected

- **Time Off Type Dropdown**:
  - Show balance for Paid Time Off (e.g., "Paid Time Off (Available: 15 days)")
  - Disable if balance is 0

- **Submit/Cancel Buttons**:
  - "Submit" (primary, green) - disabled if validation fails
  - "Cancel" (secondary, gray) - closes modal without saving

- **Success Message**:
  - Toast notification: "Leave request submitted successfully"
  - Or inline message in modal before closing

---

## 📄 Page 6: Settings Page (Inferred from Wireframes)

### 6.1 Settings/Employee Management

#### Design Elements (Based on Wireframe Notes):
- **Employee Management**:
  - Add Employee button
  - Delete Employee button/action
  - Activate/Deactivate Employee toggle
- **Other Settings**: (TBD based on requirements)

#### ⚠️ Critical Design Notes:

1. **Add Employee**:
   - Button opens form/modal
   - Similar to Sign Up form but with all fields
   - Admin creates employee account
   - Send credentials via email? (future enhancement)

2. **Delete Employee**:
   - Soft delete (recommended) or hard delete?
   - Confirmation dialog: "Are you sure? This action cannot be undone."
   - Check for dependencies (attendance records, leave requests)
   - Warning if employee has active records

3. **Activate/Deactivate**:
   - Toggle switch or button
   - Deactivated employees cannot login
   - Show status: Active (green) / Inactive (gray)

#### ✅ Validation Requirements:

```
Add Employee:
  - All profile fields validated
  - Employee ID must be unique
  - Email must be unique
  - Generate temporary password (or allow Admin to set)

Delete Employee:
  - Verify employee exists
  - Check for dependencies (warn if exists)
  - Confirmation required
  - Audit log: Who deleted, when

Activate/Deactivate:
  - Verify employee exists
  - Toggle status
  - Confirmation for deactivation: "Employee will not be able to login. Continue?"
  - Notification to employee (if deactivated)
```

---

## 🎨 Overall Design System & Consistency

### Color Scheme:
- **Primary**: Green (success, approve, present status)
- **Secondary**: Red (error, reject, absent status)
- **Warning**: Yellow/Orange (pending, half-day)
- **Info**: Blue (leave, information)
- **Neutral**: Gray (disabled, inactive)

### Typography:
- **Headers**: Bold, larger font
- **Body**: Regular, readable font size (14-16px)
- **Labels**: Medium weight, clear hierarchy

### Spacing:
- Consistent padding/margins (8px grid system recommended)
- Card spacing: 16-24px
- Form field spacing: 12-16px

### Icons:
- Use consistent icon library (Font Awesome, Material Icons, etc.)
- Status indicators: Checkmark (✓), Cross (✗), Clock (⏰), Calendar (📅)

### Responsive Breakpoints:
- Mobile: < 768px (single column, stacked layout)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3-4 columns, side-by-side forms)

---

## ✅ Implementation Priority Checklist

### Phase 1: Core Pages
- [ ] Login Page
- [ ] Sign Up Page
- [ ] Dashboard (basic layout)
- [ ] Profile Page (view mode)

### Phase 2: Authentication & Authorization
- [ ] Role-based access control
- [ ] Email verification
- [ ] Password reset flow
- [ ] Session management

### Phase 3: Profile Management
- [ ] Profile edit functionality
- [ ] Profile picture upload
- [ ] Document upload (Admin only)
- [ ] Field validation

### Phase 4: Attendance
- [ ] Check In/Check Out functionality
- [ ] Attendance table (employee view)
- [ ] Attendance table (Admin/HR view)
- [ ] Status calculation logic
- [ ] Manual edit (Admin/HR)

### Phase 5: Time Off Management
- [ ] Time Off request form
- [ ] Time Off list (employee view)
- [ ] Time Off list (Admin/HR view)
- [ ] Approval/Rejection functionality
- [ ] Leave balance tracking

### Phase 6: Salary Management
- [ ] Salary Info tab (Admin only)
- [ ] Salary calculation logic
- [ ] Update salary functionality

### Phase 7: Settings & Admin
- [ ] Settings page
- [ ] Add Employee
- [ ] Delete/Activate/Deactivate Employee
- [ ] Export functionality

---

## 🚨 Critical Issues to Resolve

1. **Role Dropdown in Signup**: Clarify if signup is public (hide role) or Admin-only
2. **Employee View of Salary**: Wireframes say "read-only for employees" but tab is hidden - clarify
3. **Attendance Widget Visibility**: Should Admin/HR see check-in/out widget?
4. **Leave Balance Calculation**: Define accrual rules, reset period, deduction timing
5. **Status Priority**: Clarify conflict resolution (e.g., checked in but also on leave)

---

**Review Date**: Current  
**Reviewed By**: AI Design Reviewer  
**Status**: ✅ **Comprehensive design review complete - Ready for implementation planning**

