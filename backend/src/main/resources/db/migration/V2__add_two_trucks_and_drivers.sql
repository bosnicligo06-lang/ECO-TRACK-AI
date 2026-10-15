-- EcoTrack AI - V2 Migration: Add Exactly Two Dedicated Drivers & Two Additional Trucks
-- Preserves existing vehicles (TRK-101 to TRK-104)

USE ecotrack_db;

-- 1. Insert Two Dedicated Drivers with BCrypt Password Hashes
INSERT INTO users (id, username, password_hash, full_name, email, role, phone, truck_id, active)
VALUES 
('USR-DRV-05', 'driver.rajesh', '$2a$10$wT3G1U7vVq0Hl.m5z8N4yeK8b8q2t5y1w4x7z0a3c6f9b2e5d8a1c', 'Rajesh Kumar', 'driver_rajesh@ecotrack.ai', 'DRIVER', '+91 98765 43210', 'TRK-105', TRUE),
('USR-DRV-06', 'driver.vikram', '$2a$10$wT3G1U7vVq0Hl.m5z8N4yeK8b8q2t5y1w4x7z0a3c6f9b2e5d8a1c', 'Vikram Singh', 'driver_vikram@ecotrack.ai', 'DRIVER', '+91 98765 43211', 'TRK-106', TRUE)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 2. Insert Exactly Two Additional Trucks with Dedicated Assigned Drivers
INSERT INTO trucks (id, registration_number, model, capacity_kg, current_load_kg, fuel_type, status, assigned_driver_id, assigned_driver_name, current_location_name, is_newly_added)
VALUES 
('TRK-105', 'MH-12-ET-2025', 'Tata Signa 2823.K Heavy Tipper', 12000, 2400, 'DIESEL', 'AVAILABLE', 'USR-DRV-05', 'Rajesh Kumar', 'Camp Cantonment Terminal, Pune', TRUE),
('TRK-106', 'MH-12-ET-2026', 'Ashok Leyland Captain 2518 Compactor', 10500, 1100, 'CNG', 'AVAILABLE', 'USR-DRV-06', 'Vikram Singh', 'Baner High Street Depot, Pune', TRUE)
ON DUPLICATE KEY UPDATE model=VALUES(model);

-- 3. Audit Log Entries for Fleet Expansion
INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, affected_entity, affected_record_id, details)
VALUES 
('AUD-901', 'USR-ADM-01', 'Aditi Sharma', 'ADMIN', 'FLEET_EXPANSION', 'Truck & Driver', 'TRK-105 & USR-DRV-05', 'Commissioned new truck MH-12-ET-2025 with dedicated driver Rajesh Kumar'),
('AUD-902', 'USR-ADM-01', 'Aditi Sharma', 'ADMIN', 'FLEET_EXPANSION', 'Truck & Driver', 'TRK-106 & USR-DRV-06', 'Commissioned new truck MH-12-ET-2026 with dedicated driver Vikram Singh');
