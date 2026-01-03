# XAMPP Database Setup Guide

## Quick Setup Steps

### Option 1: Using phpMyAdmin (Recommended)

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start Apache and MySQL services

2. **Open phpMyAdmin**
   - Go to: http://localhost/phpmyadmin
   - Default login: Username: `root`, Password: (leave empty)

3. **Create Database**
   - Click on "SQL" tab
   - Copy and paste the contents of `create_database.sql`
   - Click "Go" to execute

4. **Verify**
   - You should see `auth_db` database in the left sidebar
   - It should contain two tables: `users` and `personal_access_tokens`

### Option 2: Using MySQL Command Line

1. **Open Command Prompt/Terminal**

2. **Navigate to XAMPP MySQL bin directory**
   ```bash
   cd C:\xampp\mysql\bin
   ```

3. **Login to MySQL**
   ```bash
   mysql -u root -p
   ```
   (Press Enter when asked for password, or enter your MySQL password if you set one)

4. **Run SQL Script**
   ```sql
   source C:\Users\Faizan Saiyad\Documents\hackathon\login\backend\database\create_database.sql
   ```
   
   OR copy-paste the SQL commands from `create_database.sql`

### Option 3: Using Laravel Migrations (After Setup)

Once database is created, you can also use Laravel migrations:

```bash
cd backend
php artisan migrate
```

## Database Configuration

After creating the database, update your `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=auth_db
DB_USERNAME=root
DB_PASSWORD=
```

**Note:** If you set a password for MySQL root user, update `DB_PASSWORD` in `.env`

## Troubleshooting

### Error: Access denied for user 'root'@'localhost'
- Check if MySQL is running in XAMPP
- Verify username and password in `.env`
- Default XAMPP MySQL root password is empty

### Error: Unknown database 'auth_db'
- Make sure you ran the SQL script to create the database
- Check database name matches in `.env` file

### Error: Table already exists
- This is normal if you run migrations multiple times
- Use `php artisan migrate:fresh` to reset (WARNING: deletes all data)

## Test Connection

After setup, test the connection:

```bash
cd backend
php artisan migrate:status
```

If successful, you'll see the migration status without errors.

