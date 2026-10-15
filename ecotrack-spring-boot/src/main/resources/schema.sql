-- EcoTrack AI MySQL Database Schema
CREATE DATABASE IF NOT EXISTS ecotrack_db;
USE ecotrack_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(30),
    ward VARCHAR(100),
    assigned_truck_id VARCHAR(50),
    badge_number VARCHAR(50),
    depot VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Trucks Table
CREATE TABLE IF NOT EXISTS trucks (
    id VARCHAR(50) PRIMARY KEY,
    reg_number VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    max_capacity_kg INT NOT NULL,
    current_load_kg INT NOT NULL DEFAULT 0,
    fuel_percentage INT NOT NULL DEFAULT 100,
    status VARCHAR(50) NOT NULL DEFAULT 'IDLE',
    driver_id VARCHAR(50),
    driver_name VARCHAR(150),
    latitude DOUBLE,
    longitude DOUBLE,
    last_maintenance VARCHAR(100)
);

-- 3. Dustbins Table
CREATE TABLE IF NOT EXISTS dustbins (
    id VARCHAR(50) PRIMARY KEY,
    location VARCHAR(200) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    fill_percentage INT NOT NULL DEFAULT 0,
    weight_kg INT NOT NULL DEFAULT 0,
    smell_level VARCHAR(50) DEFAULT 'Normal',
    waste_type VARCHAR(50) DEFAULT 'Wet Organic',
    status VARCHAR(50) DEFAULT 'NORMAL',
    latitude DOUBLE,
    longitude DOUBLE,
    last_emptied VARCHAR(100)
);

-- 4. Pickup Tasks Table
CREATE TABLE IF NOT EXISTS pickup_tasks (
    id VARCHAR(50) PRIMARY KEY,
    bin_id VARCHAR(50),
    truck_id VARCHAR(50) NOT NULL,
    driver_id VARCHAR(50) NOT NULL,
    location VARCHAR(200) NOT NULL,
    waste_type VARCHAR(50) NOT NULL,
    estimated_weight_kg INT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'Normal',
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    assigned_by VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at VARCHAR(100)
);

-- 5. Ward Complaints / Incoming Requests Table
CREATE TABLE IF NOT EXISTS ward_complaints (
    id VARCHAR(50) PRIMARY KEY,
    citizen_name VARCHAR(150) NOT NULL,
    citizen_phone VARCHAR(50) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    waste_type VARCHAR(50) NOT NULL,
    estimated_weight_kg INT NOT NULL DEFAULT 50,
    priority VARCHAR(50) NOT NULL DEFAULT 'Normal',
    status VARCHAR(50) NOT NULL DEFAULT 'Pending Manual Assignment',
    source VARCHAR(50) NOT NULL DEFAULT 'Call',
    email VARCHAR(150),
    assigned_driver_id VARCHAR(50),
    assigned_truck_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Waste Data Entries Table (Segregation Portal)
CREATE TABLE IF NOT EXISTS waste_data_entries (
    id VARCHAR(50) PRIMARY KEY,
    entry_date VARCHAR(50) NOT NULL,
    location VARCHAR(150) NOT NULL,
    wet_kg INT NOT NULL DEFAULT 0,
    dry_kg INT NOT NULL DEFAULT 0,
    hazardous_kg INT NOT NULL DEFAULT 0,
    total_kg INT NOT NULL DEFAULT 0,
    remarks TEXT,
    entered_by VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Device Alerts Table
CREATE TABLE IF NOT EXISTS device_alerts (
    id VARCHAR(50) PRIMARY KEY,
    bin_id VARCHAR(50),
    truck_id VARCHAR(50),
    alert_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'INFO',
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    actor_id VARCHAR(50),
    actor_name VARCHAR(150),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    record_id VARCHAR(50),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
