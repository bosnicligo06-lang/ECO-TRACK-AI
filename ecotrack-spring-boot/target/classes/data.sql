-- EcoTrack AI Seed Data

-- Users (Admin, Drivers, Segregation Officer)
INSERT INTO users (id, username, email, password, full_name, role, phone, ward, assigned_truck_id, badge_number, depot)
VALUES 
('USR-ADM-01', 'admin', 'admin@chennaiwaste.gov.in', 'admin123', 'S. Rajendran, IAS', 'ADMIN', '+91 94440 12345', 'Greater Chennai Corporation', NULL, 'GCC-HQ-001', 'Ripon Building Command Center'),
('USR-DRV-01', 'murugan.driver', 'murugan.driver@chennaiwaste.gov.in', 'driver123', 'Murugan K.', 'DRIVER', '+91 98410 76543', 'Zone 09 - Mylapore', 'TRUCK-500', 'GCC-DRV-504', 'Mylapore Zonal Depot'),
('USR-DRV-02', 'selvam.driver', 'selvam.driver@chennaiwaste.gov.in', 'driver123', 'Selvam R.', 'DRIVER', '+91 98411 98765', 'Zone 10 - T. Nagar', 'TRUCK-1000', 'GCC-DRV-102', 'T. Nagar Garage'),
('USR-DRV-03', 'ramesh.auto', 'ramesh.auto@chennaiwaste.gov.in', 'auto123', 'Ramesh P.', 'DRIVER', '+91 98401 22334', 'Zone 05 - Royapuram', 'AUTO-100-1', 'GCC-DRV-089', 'Royapuram Depot'),
('USR-DRV-04', 'vijay.auto', 'vijay.auto@chennaiwaste.gov.in', 'auto123', 'Vijay S.', 'DRIVER', '+91 98402 33445', 'Zone 08 - Anna Nagar', 'AUTO-100-2', 'GCC-DRV-091', 'Anna Nagar West Depot'),
('USR-SEG-01', 'kavitha.segregation', 'kavitha.seg@chennaiwaste.gov.in', 'officer123', 'Kavitha Sundaram', 'SEGREGATION_USER', '+91 97909 54321', 'Zone 09 - Ward 124', NULL, 'GCC-SEG-045', 'Mylapore Waste Processing Facility')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Trucks
INSERT INTO trucks (id, reg_number, model, max_capacity_kg, current_load_kg, fuel_percentage, status, driver_id, driver_name, latitude, longitude, last_maintenance)
VALUES
('TRUCK-500', 'TN-01-GA-5421', 'Tata Ace XL (500kg EV Compactor)', 500, 180, 85, 'COLLECTING', 'USR-DRV-01', 'Murugan K.', 13.0336, 80.2676, '2025-05-10'),
('TRUCK-1000', 'TN-01-GB-9812', 'Ashok Leyland Dost (1000kg Heavy)', 1000, 420, 78, 'COLLECTING', 'USR-DRV-02', 'Selvam R.', 13.0418, 80.2341, '2025-05-08'),
('AUTO-100-1', 'TN-01-EA-1101', 'Piaggio Ape E-City (100kg Narrow Lane)', 100, 30, 92, 'COLLECTING', 'USR-DRV-03', 'Ramesh P.', 13.1090, 80.2944, '2025-05-12'),
('AUTO-100-2', 'TN-01-EA-1102', 'Mahindra Treo Zor (100kg Narrow Lane)', 100, 20, 90, 'IDLE', 'USR-DRV-04', 'Vijay S.', 13.0850, 80.2100, '2025-05-11')
ON DUPLICATE KEY UPDATE model=VALUES(model);

-- Dustbins
INSERT INTO dustbins (id, location, ward, zone, fill_percentage, weight_kg, smell_level, waste_type, status, latitude, longitude, last_emptied)
VALUES
('BIN-01', 'Luz Church Road, Mylapore', 'Ward 124', 'Zone 09', 92, 140, 'High', 'Wet Organic', 'CRITICAL', 13.0336, 80.2676, '4 hours ago'),
('BIN-02', 'Ranganathan Street, T. Nagar', 'Ward 136', 'Zone 10', 88, 115, 'Moderate', 'Mixed', 'WARNING', 13.0418, 80.2341, '3 hours ago'),
('BIN-03', 'LB Road, Adyar', 'Ward 173', 'Zone 13', 45, 60, 'Low', 'Dry Recyclable', 'NORMAL', 13.0064, 80.2575, '1 hour ago'),
('BIN-04', '2nd Avenue, Anna Nagar', 'Ward 102', 'Zone 08', 75, 95, 'Moderate', 'Sanitary Hazardous', 'WARNING', 13.0850, 80.2100, '5 hours ago')
ON DUPLICATE KEY UPDATE location=VALUES(location);

-- Incoming Notifications / Requests for Manual Allocation (Pre-loaded as requested)
INSERT INTO ward_complaints (id, citizen_name, citizenPhone, ward, address, waste_type, estimated_weight_kg, priority, status, source, email, assigned_driver_id, assigned_truck_id)
VALUES
('NOTIF-01', 'Mylapore Residents Association', '044-24981122', 'Ward 124 - Mylapore', 'Luz Church Road, Mylapore', 'Wet Organic', 120, 'High', 'Pending Manual Assignment', 'Email', 'ecotrackai123@gmail.com', NULL, NULL),
('NOTIF-02', 'T. Nagar Merchant Union', '1913-Ext-44', 'Ward 136 - T. Nagar', 'T. Nagar Commercial Hub', 'Mixed', 85, 'Urgent', 'Pending Manual Assignment', 'Call', NULL, NULL, NULL),
('NOTIF-03', 'Adyar Green Welfare', '044-24410987', 'Ward 173 - Adyar', 'LB Road, Adyar', 'Dry Recyclable', 95, 'Normal', 'Pending Manual Assignment', 'Email', 'ecotrackai123@gmail.com', NULL, NULL),
('NOTIF-04', 'Anna Nagar West Welfare Club', '1913-Ext-12', 'Ward 102 - Anna Nagar', '2nd Avenue, Anna Nagar', 'Sanitary Hazardous', 40, 'High', 'Pending Manual Assignment', 'Call', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE citizen_name=VALUES(citizen_name);

-- Segregation Portal - Preloaded Waste Data Entries (Sums to 1,245 kg total: Wet 680 kg [54.6%], Dry 420 kg [33.7%], Hazardous 145 kg [11.7%])
INSERT INTO waste_data_entries (id, entry_date, location, wet_kg, dry_kg, hazardous_kg, total_kg, remarks, entered_by)
VALUES
('WST-2025-001', '2025-05-14', 'Ward 124 - Mylapore Market Hub', 380, 240, 80, 700, 'Morning vegetable market wet waste + dry packaging cartons', 'Kavitha Sundaram'),
('WST-2025-002', '2025-05-14', 'Ward 126 - Santhome Residential Sector', 300, 180, 65, 545, 'Door-to-door segregated collection from 480 households', 'Kavitha Sundaram')
ON DUPLICATE KEY UPDATE location=VALUES(location);

-- Initial Pickup Tasks
INSERT INTO pickup_tasks (id, bin_id, truck_id, driver_id, location, waste_type, estimated_weight_kg, priority, status, assigned_by, notes)
VALUES
('TSK-CHN-8821', 'BIN-01', 'TRUCK-500', 'USR-DRV-01', 'Luz Church Road, Mylapore', 'Wet Organic', 140, 'High', 'Assigned', 'Automated IoT Sensor trigger (fill 92%)', 'Immediate clearance required'),
('TSK-CHN-8822', 'BIN-02', 'TRUCK-1000', 'USR-DRV-02', 'Ranganathan Street, T. Nagar', 'Mixed', 115, 'Urgent', 'Assigned', 'Control Room Operator (Call 1913)', 'Commercial zone clearance')
ON DUPLICATE KEY UPDATE location=VALUES(location);
