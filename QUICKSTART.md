# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Fast Setup

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# For SQLite (easiest)
touch database/database.sqlite
# Then in .env set: DB_CONNECTION=sqlite

# OR for MySQL
# Update .env with your database credentials

php artisan migrate
php artisan serve
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## ✅ That's it!

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## 🧪 Test It

1. Go to http://localhost:3000
2. Click "Sign up"
3. Create an account
4. You'll be redirected to Dashboard!

## 📝 Default Test Credentials

After registration, you can login with:
- Email: (the email you registered)
- Password: (the password you set)

---

**Note:** This project uses Laravel 9 which supports PHP 8.0+. If you have PHP 8.0, you're all set!

**Need help?** Check the full README.md for detailed instructions.

