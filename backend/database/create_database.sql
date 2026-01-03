-- =====================================================
-- XAMPP MySQL Database Setup for Authentication App
-- =====================================================
-- 
-- Instructions:
-- 1. Open phpMyAdmin (http://localhost/phpmyadmin)
-- 2. Go to SQL tab
-- 3. Copy and paste this SQL script
-- 4. Click "Go" to execute
--
-- OR use MySQL command line:
-- mysql -u root -p < create_database.sql
-- =====================================================

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS `auth_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE `auth_db`;

-- =====================================================
-- Create Users Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Personal Access Tokens Table (for Sanctum)
-- =====================================================
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Verification Query (Optional - to check tables)
-- =====================================================
-- Uncomment below to verify tables were created:
-- SHOW TABLES;
-- DESCRIBE users;
-- DESCRIBE personal_access_tokens;

