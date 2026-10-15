-- EcoTrack AI - MySQL Database Schema
CREATE DATABASE IF NOT EXISTS ecotrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecotrack_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'SEGREGATION_EMPLOYEE', 'DRIVER') NOT NULL,
    phone VARCHAR(20),
    station_id VARCHAR(36),
    truck_id VARCHAR(36),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Trucks Table
CREATE TABLE IF NOT EXISTS trucks (
    id VARCHAR(36) PRIMARY KEY,
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    capacity_kg INT NOT NULL,
    current_load_kg INT DEFAULT 0,
    fuel_type ENUM('DIESEL', 'CNG', 'ELECTRIC') NOT NULL,
    status ENUM('AVAILABLE', 'ACTIVE', 'MAINTENANCE', 'BREAKDOWN') NOT NULL DEFAULT 'AVAILABLE',
    assigned_driver_id VARCHAR(36),
    assigned_driver_name VARCHAR(100),
    last_latitude DECIMAL(10, 6),
    last_longitude DECIMAL(10, 6),
    last_gps_update TIMESTAMP NULL,
    current_location_name VARCHAR(255),
    is_newly_added BOOLEAN DEFAULT FALSE,
    mileage_km INT DEFAULT 0,
    INDEX idx_truck_status (status)
) ENGINE=InnoDB;

-- 3. Financial Transactions Table (Strict DECIMAL for INR Currency)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id VARCHAR(36) PRIMARY KEY,
    reference_number VARCHAR(50) NOT NULL UNIQUE,
    transaction_date DATE NOT NULL,
    type ENUM('REVENUE', 'EXPENSE') NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    amount_inr DECIMAL(14, 2) NOT NULL,
    payment_method VARCHAR(30),
    approval_status ENUM('APPROVED', 'PENDING', 'REJECTED') DEFAULT 'APPROVED',
    approved_by_admin VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_txn_date (transaction_date),
    INDEX idx_txn_type (type)
) ENGINE=InnoDB;

-- 4. Collection Tasks Table
CREATE TABLE IF NOT EXISTS collection_tasks (
    id VARCHAR(36) PRIMARY KEY,
    source_name VARCHAR(150) NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    category ENUM('WET', 'DRY', 'RECYCLABLE', 'SANITARY', 'SPECIAL_CARE') NOT NULL,
    estimated_quantity_kg INT NOT NULL,
    actual_quantity_kg INT NULL,
    bin_fill_percentage INT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    priority_score INT NOT NULL,
    priority_explanation TEXT,
    scheduled_time TIMESTAMP NULL,
    assigned_truck_id VARCHAR(36),
    assigned_driver_id VARCHAR(36),
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED') DEFAULT 'PENDING',
    complaint_count INT DEFAULT 0,
    days_since_last_collection INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_task_status (status)
) ENGINE=InnoDB;

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    actor_id VARCHAR(36) NOT NULL,
    actor_name VARCHAR(100) NOT NULL,
    actor_role VARCHAR(30) NOT NULL,
    action VARCHAR(50) NOT NULL,
    affected_entity VARCHAR(50) NOT NULL,
    affected_record_id VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
) ENGINE=InnoDB;
