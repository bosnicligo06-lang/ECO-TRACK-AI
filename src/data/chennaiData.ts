import { 
  User, 
  Truck, 
  Dustbin, 
  LevelSensor, 
  WeightSensor, 
  SmellSensor, 
  StreetCamera, 
  DeviceAlert, 
  PickupTask, 
  SegregationRequest, 
  WardComplaint, 
  AuditLog 
} from '../types';

export const CHENNAI_USERS: User[] = [
  {
    id: 'USR-ADMIN-01',
    username: 'admin',
    fullName: 'S. Rajendran, IAS (Zonal Commissioner)',
    email: 'admin@chennaiwaste.gov.in',
    role: 'ADMIN',
    phone: '+91 94440 01122',
    assignedZone: 'T. Nagar',
    active: true,
    createdAt: '2026-01-05T09:00:00Z',
    password: 'admin123',
    designation: 'Zonal Commissioner & Executive Officer (IAS)',
    employeeId: 'ECO-ADM-2026-9042',
    department: 'Solid Waste Management & Smart City Mission',
    apiKey: 'ecotrack_live_chennai_99a8f27b401e9c20a1',
    twoFactorEnabled: true
  },
  {
    id: 'USR-DRIVER-500',
    username: 'driver.murugan',
    fullName: 'Murugan K. (Driver — 500kg Tipper)',
    email: 'murugan.driver@chennaiwaste.gov.in',
    role: 'DRIVER',
    phone: '+91 94441 23451',
    assignedTruckId: 'TRUCK-500',
    assignedZone: 'T. Nagar',
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
    password: 'driver123',
    designation: 'Municipal Heavy Vehicle Operator',
    employeeId: 'ECO-DRV-500-1102',
    department: 'Fleet Logistics & Mechanical Operations'
  },
  {
    id: 'USR-DRIVER-1000',
    username: 'driver.selvam',
    fullName: 'Selvam R. (Driver — 1000kg Compactor)',
    email: 'selvam.driver@chennaiwaste.gov.in',
    role: 'DRIVER',
    phone: '+91 94442 67892',
    assignedTruckId: 'TRUCK-1000',
    assignedZone: 'Adyar',
    active: true,
    createdAt: '2026-01-10T08:30:00Z',
    password: 'driver123',
    designation: 'Senior Compactor Truck Specialist',
    employeeId: 'ECO-DRV-1000-1105',
    department: 'Fleet Logistics & Mechanical Operations'
  },
  {
    id: 'USR-DRIVER-AUTO1',
    username: 'driver.ramesh',
    fullName: 'Ramesh P. (Driver — Eco Auto 01)',
    email: 'ramesh.auto@chennaiwaste.gov.in',
    role: 'DRIVER',
    phone: '+91 94443 11223',
    assignedTruckId: 'AUTO-100-1',
    assignedZone: 'Anna Nagar',
    active: true,
    createdAt: '2026-02-01T08:00:00Z',
    password: 'driver123',
    designation: 'Auto Waste Collection Specialist',
    employeeId: 'ECO-DRV-AUTO-201',
    department: 'Citizen Grievance Rapid Response Fleet'
  },
  {
    id: 'USR-DRIVER-AUTO2',
    username: 'driver.vijay',
    fullName: 'Vijay S. (Driver — Eco Auto 02, 200kg)',
    email: 'vijay.auto@chennaiwaste.gov.in',
    role: 'DRIVER',
    phone: '+91 94444 33445',
    assignedTruckId: 'AUTO-100-2',
    assignedZone: 'Mylapore',
    active: true,
    createdAt: '2026-02-01T08:30:00Z',
    password: 'driver123',
    designation: 'Auto Waste Collection Specialist',
    employeeId: 'ECO-DRV-AUTO-202',
    department: 'Citizen Grievance Rapid Response Fleet'
  },
  {
    id: 'USR-SEGREGATION-01',
    username: 'kavitha.segregation',
    fullName: 'Kavitha Sundaram (Ward Segregation Officer)',
    email: 'kavitha.segregation@chennaiwaste.gov.in',
    role: 'SEGREGATION_USER',
    phone: '+91 98401 55667',
    assignedZone: 'Mylapore',
    active: true,
    createdAt: '2026-01-15T10:00:00Z',
    password: 'seg123',
    designation: 'Chief Ward Segregation & Citizen Liaison',
    employeeId: 'ECO-SGR-2026-3041',
    department: 'Community Sanitation & Citizen Welfare'
  }
];

export const INITIAL_CHENNAI_TRUCKS: Truck[] = [
  {
    id: 'TRUCK-500',
    registrationNumber: 'TN-01-GA-5001',
    name: 'Chennai Green Tipper 500',
    model: 'Tata Ace Gold EV Hydraulic Tipper',
    maxPayloadKg: 500,
    vehicleType: 'TIPPER',
    verifiedCurrentPayloadKg: 180,
    estimatedAdditionalCollectionKg: 120,
    remainingCapacityKg: 320, // 500 - 180
    payloadPercentage: 36,
    status: 'AVAILABLE',
    driverId: 'USR-DRIVER-500',
    driverName: 'Murugan K.',
    driverPhone: '+91 94441 23451',
    currentLatitude: 13.0418,
    currentLongitude: 80.2341,
    currentZone: 'T. Nagar',
    lastGpsUpdate: new Date().toISOString(),
    isGpsOnline: true,
    weightSensorHealth: 'HEALTHY',
    capacityConfidence: 'VERIFIED',
    isOverloaded: false,
    fuelOrBattery: 'Electric (Lithium-ion 78%)',
    safetyRestricted: false
  },
  {
    id: 'TRUCK-1000',
    registrationNumber: 'TN-09-GB-1002',
    name: 'Chennai Heavy Compactor 1000',
    model: 'Ashok Leyland BADA DOST Heavy Compactor',
    maxPayloadKg: 1000,
    vehicleType: 'HEAVY_COMPACTOR',
    verifiedCurrentPayloadKg: 420,
    estimatedAdditionalCollectionKg: 280,
    remainingCapacityKg: 580, // 1000 - 420
    payloadPercentage: 42,
    status: 'EN_ROUTE',
    driverId: 'USR-DRIVER-1000',
    driverName: 'Selvam R.',
    driverPhone: '+91 94442 67892',
    currentLatitude: 13.0012,
    currentLongitude: 80.2565,
    currentZone: 'Adyar',
    lastGpsUpdate: new Date().toISOString(),
    isGpsOnline: true,
    weightSensorHealth: 'HEALTHY',
    capacityConfidence: 'VERIFIED',
    isOverloaded: false,
    fuelOrBattery: 'CNG Dual Tank (82%)',
    safetyRestricted: false
  },
  {
    id: 'AUTO-100-1',
    registrationNumber: 'TN-02-EA-1001',
    name: 'Eco Auto 01',
    model: 'Mahindra Treo Zor Electric Waste Auto',
    maxPayloadKg: 100,
    vehicleType: 'AUTO_RICKSHAW',
    verifiedCurrentPayloadKg: 0,
    estimatedAdditionalCollectionKg: 0,
    remainingCapacityKg: 100, // 100 - 0
    payloadPercentage: 0,
    status: 'AVAILABLE',
    driverId: 'USR-DRIVER-AUTO1',
    driverName: 'Ramesh P.',
    driverPhone: '+91 94443 11223',
    currentLatitude: 13.0827,
    currentLongitude: 80.2707,
    currentZone: 'Anna Nagar',
    lastGpsUpdate: new Date().toISOString(),
    isGpsOnline: true,
    weightSensorHealth: 'HEALTHY',
    capacityConfidence: 'VERIFIED',
    isOverloaded: false,
    fuelOrBattery: 'Electric (Lithium-ion 94%)',
    safetyRestricted: false
  },
  {
    id: 'AUTO-100-2',
    registrationNumber: 'TN-02-EA-1002',
    name: 'Eco Auto 02',
    model: 'Piaggio Ape E-City 200kg Electric Hopper Auto',
    maxPayloadKg: 200,
    vehicleType: 'AUTO_RICKSHAW',
    verifiedCurrentPayloadKg: 0,
    estimatedAdditionalCollectionKg: 0,
    remainingCapacityKg: 200, // 200 - 0
    payloadPercentage: 0,
    status: 'AVAILABLE',
    driverId: 'USR-DRIVER-AUTO2',
    driverName: 'Vijay S.',
    driverPhone: '+91 94444 33445',
    currentLatitude: 13.0336,
    currentLongitude: 80.2687,
    currentZone: 'Mylapore',
    lastGpsUpdate: new Date().toISOString(),
    isGpsOnline: true,
    weightSensorHealth: 'HEALTHY',
    capacityConfidence: 'VERIFIED',
    isOverloaded: false,
    fuelOrBattery: 'Electric (Lithium-ion 89%)',
    safetyRestricted: false
  }
];

export const INITIAL_CHENNAI_BINS: Dustbin[] = [
  // 1. T. Nagar
  {
    id: 'BIN-CHN-TN-01',
    streetAddress: 'Usman Road, Near Panagal Park, T. Nagar',
    zone: 'T. Nagar',
    latitude: 13.0418,
    longitude: 80.2341,
    binType: 'COMMERCIAL_MIXED',
    maxPhysicalCapacityKg: 250,
    levelSensorId: 'LS-TN-01',
    weightSensorId: 'WS-TN-01',
    smellSensorId: 'SS-TN-01',
    cameraId: 'CAM-TN-01',
    latestFillPercentage: 92,
    currentWeightKg: 165,
    smellIndexPpm: 18.4,
    lastSensorUpdate: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'PENDING_ALLOCATION',
    pickupPriority: 'HIGH_URGENT',
    fillRatePerHour: 8.5,
    estimatedTimeToFullHours: 0.9,
    maintenanceNotes: 'Commercial shopping stretch; rapid weekend filling rate'
  },
  {
    id: 'BIN-CHN-TN-02',
    streetAddress: 'Ranganathan Street Corner, T. Nagar',
    zone: 'T. Nagar',
    latitude: 13.0375,
    longitude: 80.2289,
    binType: 'DRY_RECYCLABLE',
    maxPhysicalCapacityKg: 200,
    levelSensorId: 'LS-TN-02',
    weightSensorId: 'WS-TN-02',
    smellSensorId: 'SS-TN-02',
    cameraId: 'CAM-TN-02',
    latestFillPercentage: 88,
    currentWeightKg: 115,
    smellIndexPpm: 6.2,
    lastSensorUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'ELIGIBLE_FOR_COLLECTION',
    pickupPriority: 'NEARLY_FULL',
    fillRatePerHour: 6.0,
    estimatedTimeToFullHours: 2.0
  },
  // 2. Adyar
  {
    id: 'BIN-CHN-ADY-01',
    streetAddress: 'L.B. Road, Near Adyar Signal, Adyar',
    zone: 'Adyar',
    latitude: 13.0012,
    longitude: 80.2565,
    binType: 'ORGANIC_WET',
    maxPhysicalCapacityKg: 300,
    levelSensorId: 'LS-ADY-01',
    weightSensorId: 'WS-ADY-01',
    smellSensorId: 'SS-ADY-01',
    cameraId: 'CAM-ADY-01',
    latestFillPercentage: 96,
    currentWeightKg: 245,
    smellIndexPpm: 32.8, // Critical smell reading
    lastSensorUpdate: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'ASSIGNED',
    assignedTruckId: 'TRUCK-1000',
    pickupPriority: 'OVERFLOW_CRITICAL',
    fillRatePerHour: 9.2,
    estimatedTimeToFullHours: 0.4,
    maintenanceNotes: 'Vegetable waste aggregation; high fermentation potential'
  },
  {
    id: 'BIN-CHN-ADY-02',
    streetAddress: 'Gandhi Nagar 2nd Main Road, Adyar',
    zone: 'Adyar',
    latitude: 13.0089,
    longitude: 80.2530,
    binType: 'DRY_RECYCLABLE',
    maxPhysicalCapacityKg: 180,
    levelSensorId: 'LS-ADY-02',
    weightSensorId: 'WS-ADY-02',
    smellSensorId: 'SS-ADY-02',
    latestFillPercentage: 42,
    currentWeightKg: 48,
    smellIndexPpm: 2.1,
    lastSensorUpdate: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'NORMAL',
    pickupPriority: 'NORMAL',
    fillRatePerHour: 3.1
  },
  // 3. Velachery
  {
    id: 'BIN-CHN-VEL-01',
    streetAddress: '100 Feet Bypass Road, Near Vijaya Nagar, Velachery',
    zone: 'Velachery',
    latitude: 12.9815,
    longitude: 80.2180,
    binType: 'COMMERCIAL_MIXED',
    maxPhysicalCapacityKg: 280,
    levelSensorId: 'LS-VEL-01',
    weightSensorId: 'WS-VEL-01',
    smellSensorId: 'SS-VEL-01',
    cameraId: 'CAM-VEL-01',
    latestFillPercentage: 84,
    currentWeightKg: 195,
    smellIndexPpm: 12.5,
    lastSensorUpdate: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'ELIGIBLE_FOR_COLLECTION',
    pickupPriority: 'NEARLY_FULL',
    fillRatePerHour: 5.5,
    estimatedTimeToFullHours: 2.9
  },
  // 4. Anna Nagar
  {
    id: 'BIN-CHN-AN-01',
    streetAddress: '2nd Avenue, Near Anna Arch, Anna Nagar',
    zone: 'Anna Nagar',
    latitude: 13.0850,
    longitude: 80.2101,
    binType: 'ORGANIC_WET',
    maxPhysicalCapacityKg: 250,
    levelSensorId: 'LS-AN-01',
    weightSensorId: 'WS-AN-01',
    smellSensorId: 'SS-AN-01',
    cameraId: 'CAM-AN-01',
    latestFillPercentage: 78,
    currentWeightKg: 135,
    smellIndexPpm: 14.1,
    lastSensorUpdate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'ELIGIBLE_FOR_COLLECTION',
    pickupPriority: 'NEARLY_FULL',
    fillRatePerHour: 4.8,
    estimatedTimeToFullHours: 4.5
  },
  // 5. Mylapore
  {
    id: 'BIN-CHN-MYL-01',
    streetAddress: 'Luz Church Road, Near Kapaleeshwarar Temple, Mylapore',
    zone: 'Mylapore',
    latitude: 13.0368,
    longitude: 80.2676,
    binType: 'ORGANIC_WET',
    maxPhysicalCapacityKg: 220,
    levelSensorId: 'LS-MYL-01',
    weightSensorId: 'WS-MYL-01',
    smellSensorId: 'SS-MYL-01',
    cameraId: 'CAM-MYL-01',
    latestFillPercentage: 91,
    currentWeightKg: 160,
    smellIndexPpm: 21.0,
    lastSensorUpdate: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'PENDING_ALLOCATION',
    pickupPriority: 'HIGH_URGENT',
    fillRatePerHour: 7.2,
    estimatedTimeToFullHours: 1.2
  },
  // 6. Guindy
  {
    id: 'BIN-CHN-GDY-01',
    streetAddress: 'GST Road, Near Guindy Metro Station, Guindy',
    zone: 'Guindy',
    latitude: 13.0067,
    longitude: 80.2025,
    binType: 'COMMERCIAL_MIXED',
    maxPhysicalCapacityKg: 260,
    levelSensorId: 'LS-GDY-01',
    weightSensorId: 'WS-GDY-01',
    cameraId: 'CAM-GDY-01',
    latestFillPercentage: 65,
    currentWeightKg: 110,
    lastSensorUpdate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'NORMAL',
    pickupPriority: 'NORMAL',
    fillRatePerHour: 4.0
  },
  // 7. Sholinganallur
  {
    id: 'BIN-CHN-SHL-01',
    streetAddress: 'OMR IT Corridor, Near Sholinganallur Junction',
    zone: 'Sholinganallur',
    latitude: 12.8996,
    longitude: 80.2279,
    binType: 'DRY_RECYCLABLE',
    maxPhysicalCapacityKg: 250,
    levelSensorId: 'LS-SHL-01',
    weightSensorId: 'WS-SHL-01',
    smellSensorId: 'SS-SHL-01',
    cameraId: 'CAM-SHL-01',
    latestFillPercentage: 89,
    currentWeightKg: 140,
    smellIndexPpm: 5.5,
    lastSensorUpdate: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'PENDING_ALLOCATION',
    pickupPriority: 'HIGH_URGENT',
    fillRatePerHour: 6.8,
    estimatedTimeToFullHours: 1.6
  },
  // 8. Tambaram
  {
    id: 'BIN-CHN-TAM-01',
    streetAddress: 'Shanmugam Road, Near Tambaram Sanatorium, Tambaram',
    zone: 'Tambaram',
    latitude: 12.9249,
    longitude: 80.1000,
    binType: 'COMMERCIAL_MIXED',
    maxPhysicalCapacityKg: 280,
    levelSensorId: 'LS-TAM-01',
    weightSensorId: 'WS-TAM-01',
    cameraId: 'CAM-TAM-01',
    latestFillPercentage: 72,
    currentWeightKg: 130,
    lastSensorUpdate: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'NORMAL',
    pickupPriority: 'NORMAL',
    fillRatePerHour: 4.5
  },
  // 9. Perungudi
  {
    id: 'BIN-CHN-PGD-01',
    streetAddress: 'Kallukuttai Main Road, Perungudi Dump Yard Approach',
    zone: 'Perungudi',
    latitude: 12.9566,
    longitude: 80.2415,
    binType: 'ORGANIC_WET',
    maxPhysicalCapacityKg: 350,
    levelSensorId: 'LS-PGD-01',
    weightSensorId: 'WS-PGD-01',
    smellSensorId: 'SS-PGD-01',
    cameraId: 'CAM-PGD-01',
    latestFillPercentage: 94,
    currentWeightKg: 280,
    smellIndexPpm: 28.5,
    lastSensorUpdate: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'PENDING_ALLOCATION',
    pickupPriority: 'OVERFLOW_CRITICAL',
    fillRatePerHour: 8.0,
    estimatedTimeToFullHours: 0.7
  },
  // 10. Ambattur
  {
    id: 'BIN-CHN-AMB-01',
    streetAddress: 'Ambattur Industrial Estate 3rd Main Road, Ambattur',
    zone: 'Ambattur',
    latitude: 13.1143,
    longitude: 80.1548,
    binType: 'SANITARY_HAZARDOUS',
    maxPhysicalCapacityKg: 200,
    levelSensorId: 'LS-AMB-01',
    weightSensorId: 'WS-AMB-01',
    cameraId: 'CAM-AMB-01',
    latestFillPercentage: 35,
    currentWeightKg: 32,
    lastSensorUpdate: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    equipmentHealth: 'NORMAL',
    collectionStatus: 'NORMAL',
    pickupPriority: 'LOW',
    fillRatePerHour: 2.0
  }
];

export const INITIAL_LEVEL_SENSORS: LevelSensor[] = [
  {
    id: 'LS-TN-01',
    binId: 'BIN-CHN-TN-01',
    fillPercentage: 92,
    rawDistanceCm: 12,
    fillState: 'FULL',
    health: 'ONLINE',
    lastMeasurementTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    batteryPercentage: 94,
    firmwareVersion: 'v2.4.1-ChennaiLoRa'
  },
  {
    id: 'LS-ADY-01',
    binId: 'BIN-CHN-ADY-01',
    fillPercentage: 96,
    rawDistanceCm: 6,
    fillState: 'OVERFLOW_RISK',
    health: 'ONLINE',
    lastMeasurementTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    batteryPercentage: 88,
    firmwareVersion: 'v2.4.1-ChennaiLoRa'
  },
  {
    id: 'LS-MYL-01',
    binId: 'BIN-CHN-MYL-01',
    fillPercentage: 91,
    rawDistanceCm: 14,
    fillState: 'FULL',
    health: 'ONLINE',
    lastMeasurementTime: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    batteryPercentage: 91,
    firmwareVersion: 'v2.4.1-ChennaiLoRa'
  },
  {
    id: 'LS-PGD-01',
    binId: 'BIN-CHN-PGD-01',
    fillPercentage: 94,
    rawDistanceCm: 8,
    fillState: 'OVERFLOW_RISK',
    health: 'ONLINE',
    lastMeasurementTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    batteryPercentage: 85,
    firmwareVersion: 'v2.4.1-ChennaiLoRa'
  },
  {
    id: 'LS-SHL-01',
    binId: 'BIN-CHN-SHL-01',
    fillPercentage: 89,
    rawDistanceCm: 18,
    fillState: 'NEARLY_FULL',
    health: 'ONLINE',
    lastMeasurementTime: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    batteryPercentage: 92,
    firmwareVersion: 'v2.4.1-ChennaiLoRa'
  }
];

export const INITIAL_WEIGHT_SENSORS: WeightSensor[] = [
  {
    id: 'WS-TRUCK-500',
    targetType: 'TRUCK',
    targetId: 'TRUCK-500',
    currentWeightKg: 180,
    tareWeightKg: 1100, // vehicle tare
    netWeightKg: 180,
    maxCapacityKg: 500,
    health: 'HEALTHY',
    isOverload: false,
    lastMeasurementTime: new Date().toISOString()
  },
  {
    id: 'WS-TRUCK-1000',
    targetType: 'TRUCK',
    targetId: 'TRUCK-1000',
    currentWeightKg: 420,
    tareWeightKg: 1950, // vehicle tare
    netWeightKg: 420,
    maxCapacityKg: 1000,
    health: 'HEALTHY',
    isOverload: false,
    lastMeasurementTime: new Date().toISOString()
  },
  {
    id: 'WS-TN-01',
    targetType: 'BIN',
    targetId: 'BIN-CHN-TN-01',
    currentWeightKg: 165,
    tareWeightKg: 35,
    netWeightKg: 165,
    maxCapacityKg: 250,
    health: 'HEALTHY',
    isOverload: false,
    lastMeasurementTime: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    id: 'WS-ADY-01',
    targetType: 'BIN',
    targetId: 'BIN-CHN-ADY-01',
    currentWeightKg: 245,
    tareWeightKg: 40,
    netWeightKg: 245,
    maxCapacityKg: 300,
    health: 'HEALTHY',
    isOverload: false,
    lastMeasurementTime: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  }
];

export const INITIAL_SMELL_SENSORS: SmellSensor[] = [
  {
    id: 'SS-TN-01',
    binId: 'BIN-CHN-TN-01',
    measuredGas: 'H2S',
    readingPpm: 18.4,
    thresholdPpm: 20.0,
    status: 'ELEVATED',
    health: 'ONLINE',
    lastMeasurementTime: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    id: 'SS-ADY-01',
    binId: 'BIN-CHN-ADY-01',
    measuredGas: 'H2S',
    readingPpm: 32.8,
    thresholdPpm: 20.0,
    status: 'CRITICAL_EXCEEDED', // Exceeded threshold
    health: 'ONLINE',
    lastMeasurementTime: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: 'SS-PGD-01',
    binId: 'BIN-CHN-PGD-01',
    measuredGas: 'NH3',
    readingPpm: 28.5,
    thresholdPpm: 25.0,
    status: 'CRITICAL_EXCEEDED',
    health: 'ONLINE',
    lastMeasurementTime: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    id: 'SS-MYL-01',
    binId: 'BIN-CHN-MYL-01',
    measuredGas: 'VOC',
    readingPpm: 21.0,
    thresholdPpm: 30.0,
    status: 'ELEVATED',
    health: 'ONLINE',
    lastMeasurementTime: new Date(Date.now() - 4 * 60 * 1000).toISOString()
  }
];

export const INITIAL_STREET_CAMERAS: StreetCamera[] = [
  {
    id: 'CAM-TN-01',
    binId: 'BIN-CHN-TN-01',
    locationName: 'Panagal Park Jct (Pole #14), T. Nagar',
    zone: 'T. Nagar',
    status: 'ACTIVE',
    lastSnapshotTimestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    snapshotUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    detectedOverflowVisual: true,
    opticalFillEstimatePct: 94,
    resolution: '1080p AI Edge (30 FPS)',
    ipAddress: '10.14.82.101'
  },
  {
    id: 'CAM-ADY-01',
    binId: 'BIN-CHN-ADY-01',
    locationName: 'L.B. Road Mast #08, Adyar',
    zone: 'Adyar',
    status: 'ACTIVE',
    lastSnapshotTimestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    snapshotUrl: 'https://images.unsplash.com/photo-1611288875785-5b8782a176d6?auto=format&fit=crop&w=600&q=80',
    detectedOverflowVisual: true,
    opticalFillEstimatePct: 98,
    resolution: '1080p AI Edge (30 FPS)',
    ipAddress: '10.14.82.102'
  },
  {
    id: 'CAM-MYL-01',
    binId: 'BIN-CHN-MYL-01',
    locationName: 'Luz Corner Mast #03, Mylapore',
    zone: 'Mylapore',
    status: 'LENS_OBSCURED', // Malfunction example
    lastSnapshotTimestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    snapshotUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    detectedOverflowVisual: false,
    opticalFillEstimatePct: 0,
    resolution: '1080p AI Edge (30 FPS)',
    ipAddress: '10.14.82.105',
    faultDescription: 'Optical obstruction: Debris/cloth covering camera lens'
  },
  {
    id: 'CAM-VEL-01',
    binId: 'BIN-CHN-VEL-01',
    locationName: 'Vijaya Nagar Jct Mast #04, Velachery',
    zone: 'Velachery',
    status: 'ACTIVE',
    lastSnapshotTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    snapshotUrl: 'https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&w=600&q=80',
    detectedOverflowVisual: false,
    opticalFillEstimatePct: 82,
    resolution: '1080p AI Edge (30 FPS)',
    ipAddress: '10.14.82.108'
  }
];

export const INITIAL_DEVICE_ALERTS: DeviceAlert[] = [
  {
    id: 'ALT-CHN-001',
    deviceType: 'SMELL_SENSOR',
    deviceId: 'SS-ADY-01',
    binId: 'BIN-CHN-ADY-01',
    zone: 'Adyar',
    severity: 'CRITICAL',
    message: 'Hydrogen Sulfide (H2S) odor reading 32.8 ppm exceeds municipal limit (20.0 ppm) at L.B. Road',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    acknowledged: false,
    resolved: false
  },
  {
    id: 'ALT-CHN-002',
    deviceType: 'CAMERA',
    deviceId: 'CAM-MYL-01',
    binId: 'BIN-CHN-MYL-01',
    zone: 'Mylapore',
    severity: 'FAULT',
    message: 'Camera Lens Obscured alert at Luz Corner Mast #03. AI vision processing confidence dropped to 0%',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    acknowledged: true,
    resolved: false
  },
  {
    id: 'ALT-CHN-003',
    deviceType: 'LEVEL_SENSOR',
    deviceId: 'LS-PGD-01',
    binId: 'BIN-CHN-PGD-01',
    zone: 'Perungudi',
    severity: 'WARNING',
    message: 'Bin fill level reached 94% (Overflow Risk) at Perungudi Dump Yard Approach',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    acknowledged: false,
    resolved: false
  }
];

export const INITIAL_PICKUP_TASKS: PickupTask[] = [
  {
    id: 'TASK-CHN-101',
    binId: 'BIN-CHN-ADY-01',
    binAddress: 'L.B. Road, Near Adyar Signal, Adyar',
    zone: 'Adyar',
    latitude: 13.0012,
    longitude: 80.2565,
    binType: 'ORGANIC_WET',
    fillPercentage: 96,
    estimatedWeightKg: 245,
    priority: 'URGENT',
    assignedTruckId: 'TRUCK-1000',
    assignedDriverId: 'USR-DRIVER-1000',
    assignedDriverName: 'Selvam R.',
    status: 'EN_ROUTE',
    allocatedRemainingCapacityUsed: 245,
    allocationReason: 'Critical fill (96%) and odor spike (32.8 ppm); assigned to TRUCK-1000 with 580kg remaining capacity',
    allocationTimestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    startedTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    verifiedBy: 'Chennai Automated Allocation Engine'
  },
  {
    id: 'TASK-CHN-102',
    binId: 'BIN-CHN-TN-01',
    binAddress: 'Usman Road, Near Panagal Park, T. Nagar',
    zone: 'T. Nagar',
    latitude: 13.0418,
    longitude: 80.2341,
    binType: 'COMMERCIAL_MIXED',
    fillPercentage: 92,
    estimatedWeightKg: 165,
    priority: 'HIGH',
    assignedTruckId: 'TRUCK-500',
    assignedDriverId: 'USR-DRIVER-500',
    assignedDriverName: 'Murugan K.',
    status: 'ASSIGNED',
    allocatedRemainingCapacityUsed: 165,
    allocationReason: 'Optimal capacity fit (165kg fits safely in TRUCK-500 remaining 320kg capacity; proximity 1.2km)',
    allocationTimestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    verifiedBy: 'Chennai Automated Allocation Engine'
  }
];

export const INITIAL_SEGREGATION_REQUESTS: SegregationRequest[] = [
  {
    id: 'REQ-CHN-001',
    userId: 'USR-SEGREGATION-01',
    userName: 'Kavitha Sundaram',
    userPhone: '+91 98401 55667',
    streetAddress: 'East Mada Street, Mylapore',
    zone: 'Mylapore',
    wasteType: 'DRY_RECYCLABLE',
    estimatedWeightKg: 95,
    preferredTime: 'Morning 10:00 AM - 12:00 PM',
    status: 'SUBMITTED',
    notes: 'Segregated cardboard, cartons, and plastic beverage bottles ready at community center',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: 'REQ-CHN-002',
    userId: 'USR-SEGREGATION-01',
    userName: 'Kavitha Sundaram',
    userPhone: '+91 98401 55667',
    streetAddress: 'North Chitrakulam Street, Mylapore',
    zone: 'Mylapore',
    wasteType: 'WET_ORGANIC',
    estimatedWeightKg: 140,
    preferredTime: 'Afternoon 02:00 PM - 04:00 PM',
    status: 'SCHEDULED',
    assignedTruckId: 'TRUCK-500',
    notes: 'Compostable temple flower and vegetable marketplace residue',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  }
];

export const INITIAL_WARD_COMPLAINTS: WardComplaint[] = [
  {
    id: 'CMP-EML-2026-101',
    citizenName: 'Dr. S. Radhakrishnan',
    phone: '+91 98401 22334',
    senderEmail: 's.radha@gmail.com',
    source: 'EMAIL',
    zone: 'Mylapore',
    streetAddress: 'Luz Church Road, Mylapore',
    landmark: 'Near Luz Corner & Kamadhenu Theatre',
    latitude: 13.0368,
    longitude: 80.2676,
    complaintType: 'BULK_ORGANIC_DUMP',
    wasteCategory: 'Wet Organic',
    quantityEstimateKg: 120,
    urgency: 'HIGH',
    description: 'Email received at ecotrackai123@gmail.com: Wet organic vegetable market refuse and commercial fruit waste piled up near Luz Church Road. Requires manual truck allocation.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    activityLog: [
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        action: 'EMAIL_RECEIVED',
        note: 'Incoming email detected from ecotrackai123@gmail.com. Parsed ward: Mylapore.',
        actor: 'EcoTrack AI Email Gateway'
      }
    ]
  },
  {
    id: 'CMP-CALL-2026-102',
    citizenName: 'K. Meenakshi',
    phone: '+91 98842 33445',
    source: 'PHONE',
    zone: 'T. Nagar',
    streetAddress: 'Ranganathan Street, T. Nagar',
    landmark: 'Near Railway Station Pedestrian Subway',
    latitude: 13.0418,
    longitude: 80.2341,
    complaintType: 'STREET_HAZARD_OVERFLOW',
    wasteCategory: 'Mixed Waste',
    quantityEstimateKg: 85,
    urgency: 'CRITICAL',
    description: '1913 Helpline Call: Urgent commercial packing boxes, wet street food residue, and mixed litter blocking shopper walkway.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    activityLog: [
      {
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        action: 'PHONE_CALL_REGISTERED',
        note: 'Grievance registered via 1913 Helpline. Logged for urgent manual assignment.',
        actor: 'Helpline Operator #04'
      }
    ]
  },
  {
    id: 'CMP-EML-2026-103',
    citizenName: 'Aditya Raman',
    phone: '+91 97910 66778',
    senderEmail: 'aditya.raman@outlook.com',
    source: 'EMAIL',
    zone: 'Adyar',
    streetAddress: 'Gandhi Nagar 2nd Main Road, Adyar',
    landmark: 'Opposite Adyar Club Junction',
    latitude: 13.0012,
    longitude: 80.2565,
    complaintType: 'DRY_RECYCLABLE_PILE',
    wasteCategory: 'Dry Recyclable',
    quantityEstimateKg: 95,
    urgency: 'NORMAL',
    description: 'Email received at ecotrackai123@gmail.com: Dry recyclable cardboard cartons, corrugated sheets, and plastic scrap piled up outside residential gated community.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    activityLog: [
      {
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        action: 'EMAIL_RECEIVED',
        note: 'Incoming email detected from ecotrackai123@gmail.com. Parsed ward: Adyar.',
        actor: 'EcoTrack AI Email Gateway'
      }
    ]
  },
  {
    id: 'CMP-CALL-2026-104',
    citizenName: 'M. Senthil',
    phone: '+91 94440 99881',
    source: 'PHONE',
    zone: 'Anna Nagar',
    streetAddress: '2nd Avenue, Anna Nagar',
    landmark: 'Near Roundtana Bus Stand',
    latitude: 13.0850,
    longitude: 80.2101,
    complaintType: 'HAZARDOUS_DISPOSAL',
    wasteCategory: 'Sanitary Hazardous',
    quantityEstimateKg: 40,
    urgency: 'HIGH',
    description: '1913 Helpline Call: Sanitary napkins and clinical blister packaging discarded in an open container. Poses health hazard; urgent collection requested.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    activityLog: [
      {
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        action: 'PHONE_CALL_REGISTERED',
        note: 'Grievance registered via 1913 Helpline. Logged for priority allocation.',
        actor: 'Helpline Operator #12'
      }
    ]
  },
  {
    id: 'CMP-CHN-01',
    citizenName: 'M. Ramesh',
    phone: '+91 98840 12345',
    source: 'PORTAL',
    zone: 'T. Nagar',
    streetAddress: 'Usman Road Flyover Foot, T. Nagar',
    landmark: 'Panagal Park flower market side',
    latitude: 13.0418,
    longitude: 80.2341,
    binId: 'BIN-CHN-TN-01',
    complaintType: 'OVERFLOW',
    wasteCategory: 'Commercial Mixed',
    quantityEstimateKg: 120,
    urgency: 'HIGH',
    description: 'Bin overflowing near Panagal Park flower market. Stray cattle gathering.',
    status: 'ASSIGNED',
    assignedTruckId: 'TRUCK-500',
    assignedDriverId: 'USR-DRIVER-500',
    assignedTaskId: 'TASK-CHN-102',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    activityLog: [
      {
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        action: 'COMPLAINT_LOGGED',
        note: 'Citizen grievance reported on portal.',
        actor: 'Citizen Portal'
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        action: 'TRUCK_DISPATCHED',
        note: 'Allocated to TRUCK-500 (Murugan K.). Remaining capacity verified.',
        actor: 'S. Rajendran, IAS'
      }
    ]
  },
  {
    id: 'CMP-CHN-02',
    citizenName: 'Deepa V.',
    phone: '+91 98410 98765',
    source: 'PORTAL',
    zone: 'Adyar',
    streetAddress: 'L.B. Road Signal, Adyar',
    landmark: 'Behind Bus Shelter',
    latitude: 13.0012,
    longitude: 80.2565,
    binId: 'BIN-CHN-ADY-01',
    complaintType: 'BAD_ODOR',
    wasteCategory: 'Organic Wet Waste',
    quantityEstimateKg: 180,
    urgency: 'CRITICAL',
    description: 'Severe pungent smell from wet waste container spreading across bus shelter.',
    status: 'IN_PROGRESS',
    assignedTruckId: 'TRUCK-1000',
    assignedDriverId: 'USR-DRIVER-1000',
    assignedTaskId: 'TASK-CHN-101',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    activityLog: [
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        action: 'COMPLAINT_LOGGED',
        note: 'Citizen grievance reported regarding acute odor.',
        actor: 'Citizen Portal'
      },
      {
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        action: 'AUTO_ALLOCATED',
        note: 'Dispatched TRUCK-1000 (Selvam R.). Driver is en route.',
        actor: 'Chennai Automated Allocation Engine'
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-CHN-901',
    actorId: 'SYSTEM',
    actorName: 'Chennai Automated Allocation Engine',
    actorRole: 'ADMIN',
    action: 'AUTO_ALLOCATION',
    entity: 'PickupTask',
    recordId: 'TASK-CHN-101',
    details: 'Auto-allocated Bin BIN-CHN-ADY-01 (245kg) to TRUCK-1000 (Selvam R.). Remaining capacity verified at 580kg.',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: 'AUD-CHN-902',
    actorId: 'SYSTEM',
    actorName: 'Chennai Automated Allocation Engine',
    actorRole: 'ADMIN',
    action: 'AUTO_ALLOCATION',
    entity: 'PickupTask',
    recordId: 'TASK-CHN-102',
    details: 'Auto-allocated Bin BIN-CHN-TN-01 (165kg) to TRUCK-500 (Murugan K.). Remaining capacity verified at 320kg.',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  },
  {
    id: 'AUD-CHN-903',
    actorId: 'USR-ADMIN-01',
    actorName: 'S. Rajendran, IAS',
    actorRole: 'ADMIN',
    action: 'FLEET_VERIFICATION',
    entity: 'Truck',
    recordId: 'TRUCK-500 & TRUCK-1000',
    details: 'Verified municipal weight sensors and calibrated maximum garbage payloads for TRUCK-500 and TRUCK-1000.',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString()
  }
];
