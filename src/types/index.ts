export type UserRole = 'ADMIN' | 'SEGREGATION_USER' | 'DRIVER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string;
  assignedZone?: string;
  assignedTruckId?: TruckId;
  avatar?: string;
  active: boolean;
  createdAt: string;
  password?: string;
  designation?: string;
  employeeId?: string;
  department?: string;
  apiKey?: string;
  twoFactorEnabled?: boolean;
}

export type ChennaiZone = 
  | 'T. Nagar' 
  | 'Adyar' 
  | 'Velachery' 
  | 'Anna Nagar' 
  | 'Mylapore' 
  | 'Tambaram' 
  | 'Perungudi' 
  | 'Ambattur' 
  | 'Guindy' 
  | 'Sholinganallur';

export type TruckStatus = 
  | 'AVAILABLE' 
  | 'RESERVED' 
  | 'ASSIGNED' 
  | 'EN_ROUTE' 
  | 'COLLECTING' 
  | 'RETURNING' 
  | 'UNLOADING' 
  | 'MAINTENANCE' 
  | 'OUT_OF_SERVICE' 
  | 'OFFLINE';

export type TruckId = 'TRUCK-500' | 'TRUCK-1000' | 'AUTO-100-1' | 'AUTO-100-2' | string;

export interface Truck {
  id: TruckId;
  registrationNumber: string;
  name: string;
  model: string;
  maxPayloadKg: number; // 100, 200, 500, or 1000
  vehicleType?: 'HEAVY_COMPACTOR' | 'TIPPER' | 'AUTO_RICKSHAW' | string;
  verifiedCurrentPayloadKg: number;
  estimatedAdditionalCollectionKg: number;
  remainingCapacityKg: number; // maxPayloadKg - verifiedCurrentPayloadKg
  payloadPercentage: number;
  status: TruckStatus;
  driverId: string;
  driverName: string;
  driverPhone: string;
  currentLatitude: number;
  currentLongitude: number;
  currentZone: string;
  lastGpsUpdate: string;
  isGpsOnline: boolean;
  weightSensorHealth: 'HEALTHY' | 'WARNING' | 'FAULT' | 'UNVERIFIED';
  capacityConfidence: 'VERIFIED' | 'ESTIMATED' | 'UNVERIFIED';
  currentRouteId?: string;
  isOverloaded: boolean;
  fuelOrBattery: string;
  safetyRestricted: boolean;
}

export type BinType = 'ORGANIC_WET' | 'DRY_RECYCLABLE' | 'SANITARY_HAZARDOUS' | 'COMMERCIAL_MIXED';

export type BinPriority = 'LOW' | 'NORMAL' | 'NEARLY_FULL' | 'HIGH_URGENT' | 'OVERFLOW_CRITICAL';

export type BinCollectionStatus = 
  | 'NORMAL' 
  | 'APPROACHING_THRESHOLD' 
  | 'ELIGIBLE_FOR_COLLECTION' 
  | 'PENDING_ALLOCATION' 
  | 'ALLOCATING'
  | 'ASSIGNED' 
  | 'COLLECTING' 
  | 'COMPLETED';

export interface Dustbin {
  id: string;
  streetAddress: string;
  zone: ChennaiZone;
  latitude: number;
  longitude: number;
  binType: BinType;
  maxPhysicalCapacityKg: number;
  levelSensorId: string;
  weightSensorId?: string;
  smellSensorId?: string;
  cameraId?: string;
  latestFillPercentage: number;
  currentWeightKg?: number;
  smellIndexPpm?: number;
  lastSensorUpdate: string;
  equipmentHealth: 'NORMAL' | 'DEGRADED' | 'FAULT' | 'OFFLINE';
  collectionStatus: BinCollectionStatus;
  lastPickupTime?: string;
  assignedTruckId?: TruckId;
  pickupPriority: BinPriority;
  fillRatePerHour: number;
  estimatedTimeToFullHours?: number;
  maintenanceNotes?: string;
}

export type FillSensorState = 
  | 'LOW' 
  | 'NORMAL' 
  | 'FILLING' 
  | 'NEARLY_FULL' 
  | 'FULL' 
  | 'OVERFLOW_RISK' 
  | 'SENSOR_FAULT' 
  | 'STALE_DATA' 
  | 'OFFLINE';

export interface LevelSensor {
  id: string;
  binId: string;
  fillPercentage: number;
  rawDistanceCm: number;
  fillState: FillSensorState;
  health: 'ONLINE' | 'CALIBRATION_WARN' | 'FAULT' | 'STALE' | 'OFFLINE';
  lastMeasurementTime: string;
  batteryPercentage: number;
  firmwareVersion: string;
}

export interface WeightSensor {
  id: string;
  targetType: 'BIN' | 'TRUCK';
  targetId: string; // bin ID or TRUCK-500 / TRUCK-1000
  currentWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  maxCapacityKg: number;
  health: 'HEALTHY' | 'WARNING' | 'FAULT' | 'CALIBRATION_REQ' | 'OFFLINE';
  isOverload: boolean;
  lastMeasurementTime: string;
}

export type SmellStatus = 
  | 'NORMAL' 
  | 'ELEVATED' 
  | 'HIGH' 
  | 'CRITICAL_EXCEEDED' 
  | 'FAULT' 
  | 'STALE' 
  | 'OFFLINE';

export interface SmellSensor {
  id: string;
  binId: string;
  measuredGas: 'H2S' | 'NH3' | 'VOC' | 'METHANE';
  readingPpm: number;
  thresholdPpm: number;
  status: SmellStatus;
  health: 'ONLINE' | 'DEGRADED' | 'FAULT' | 'OFFLINE';
  lastMeasurementTime: string;
}

export type CameraStatus = 'ACTIVE' | 'LENS_OBSCURED' | 'OFFLINE' | 'MALFUNCTION' | 'SIGNAL_LOSS';

export interface StreetCamera {
  id: string;
  binId: string;
  locationName: string;
  zone: ChennaiZone;
  status: CameraStatus;
  lastSnapshotTimestamp: string;
  snapshotUrl: string;
  detectedOverflowVisual: boolean;
  opticalFillEstimatePct: number;
  resolution: string;
  ipAddress: string;
  faultDescription?: string;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'FAULT';

export interface DeviceAlert {
  id: string;
  deviceType: 'LEVEL_SENSOR' | 'WEIGHT_SENSOR' | 'SMELL_SENSOR' | 'CAMERA' | 'TRUCK_GPS' | 'OVERLOAD';
  deviceId: string;
  binId?: string;
  zone?: ChennaiZone;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export type TaskStatus = 
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'DRIVER_ACCEPTED'
  | 'EN_ROUTE_PICKUP'
  | 'EN_ROUTE'
  | 'ARRIVED_PICKUP'
  | 'COLLECTING'
  | 'WASTE_COLLECTED'
  | 'EN_ROUTE_DISPOSAL'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'AWAITING_THRESHOLD'
  | 'ELIGIBLE_FOR_COLLECTION'
  | 'PENDING_ALLOCATION'
  | 'ALLOCATING'
  | 'REASSIGNMENT_REQUIRED'
  | 'CAPACITY_BLOCKED';

export interface PickupTask {
  id: string;
  binId?: string;
  complaintId?: string;
  pickupType?: 'BIN' | 'CITIZEN_COMPLAINT' | 'SEGREGATION';
  binAddress: string;
  zone: ChennaiZone;
  latitude: number;
  longitude: number;
  binType?: BinType;
  wasteCategory?: string;
  fillPercentage?: number;
  estimatedWeightKg: number;
  actualWeightKg?: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  assignedTruckId: TruckId;
  assignedDriverId: string;
  assignedDriverName: string;
  driverPhone?: string;
  status: TaskStatus;
  allocatedRemainingCapacityUsed: number;
  allocationReason: string;
  allocationTimestamp: string;
  assignedTime?: string;
  driverAcceptedTime?: string;
  timestamp?: string;
  startedTime?: string;
  arrivedTime?: string;
  arrivedPickupTime?: string;
  collectedTime?: string;
  completedTime?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  completionPhotoUrl?: string;
  driverRemarks?: string;
  destinationName?: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  liveGps?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    speedKmph?: number;
    isStale?: boolean;
  };
  activityHistory?: {
    timestamp: string;
    status: string;
    note: string;
    actor: string;
  }[];
  verifiedBy?: string;
}

export interface SegregationRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  streetAddress: string;
  zone: ChennaiZone;
  wasteType: 'WET_ORGANIC' | 'DRY_RECYCLABLE' | 'SANITARY_HAZARDOUS' | 'BULK_COMMERCIAL';
  estimatedWeightKg: number;
  preferredTime: string;
  status: 'SUBMITTED' | 'SCHEDULED' | 'PICKED_UP' | 'CANCELLED';
  assignedTruckId?: TruckId;
  notes?: string;
  createdAt: string;
}

export type ComplaintStatus = 
  | 'NEW' 
  | 'UNDER_REVIEW' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'REJECTED' 
  | 'CANCELLED'
  | 'OPEN' 
  | 'INVESTIGATING';

export interface WardComplaint {
  id: string;
  citizenName: string;
  phone: string;
  senderEmail?: string;
  subject?: string;
  operatorName?: string;
  investigationNotes?: string;
  source: 'EMAIL' | 'PHONE' | 'PORTAL';
  zone: ChennaiZone;
  streetAddress: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  binId?: string;
  complaintType?: string;
  wasteCategory?: string;
  quantityEstimateKg?: number;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  description: string;
  status: ComplaintStatus;
  assignedTruckId?: TruckId;
  assignedDriverId?: string;
  assignedTaskId?: string;
  cancellationReason?: string;
  rejectionReason?: string;
  escalationNotes?: string;
  actualCollectedKg?: number;
  createdAt: string;
  resolvedAt?: string;
  activityLog?: {
    timestamp: string;
    action: string;
    note: string;
    actor: string;
  }[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  recordId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface WasteDataEntry {
  id: string;
  date: string;
  location: string;
  wetKg: number;
  dryKg: number;
  hazardousKg: number;
  totalKg: number;
  remarks?: string;
  enteredBy: string;
  createdAt: string;
}
