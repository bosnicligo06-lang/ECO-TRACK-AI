package com.ecotrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "trucks")
public class Truck {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "reg_number", nullable = false, length = 50)
    private String regNumber;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "max_capacity_kg", nullable = false)
    private int maxCapacityKg;

    @Column(name = "current_load_kg", nullable = false)
    private int currentLoadKg;

    @Column(name = "fuel_percentage", nullable = false)
    private int fuelPercentage;

    @Column(nullable = false, length = 50)
    private String status; // IDLE, COLLECTING, MAINTENANCE, FULL

    @Column(name = "driver_id", length = 50)
    private String driverId;

    @Column(name = "driver_name", length = 150)
    private String driverName;

    private Double latitude;
    private Double longitude;

    @Column(name = "last_maintenance", length = 100)
    private String lastMaintenance;

    public Truck() {}

    public int getRemainingCapacityKg() {
        return Math.max(0, maxCapacityKg - currentLoadKg);
    }

    public int getLoadPercentage() {
        if (maxCapacityKg <= 0) return 0;
        return (int) Math.round(((double) currentLoadKg / maxCapacityKg) * 100);
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRegNumber() { return regNumber; }
    public void setRegNumber(String regNumber) { this.regNumber = regNumber; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public int getMaxCapacityKg() { return maxCapacityKg; }
    public void setMaxCapacityKg(int maxCapacityKg) { this.maxCapacityKg = maxCapacityKg; }

    public int getCurrentLoadKg() { return currentLoadKg; }
    public void setCurrentLoadKg(int currentLoadKg) { this.currentLoadKg = currentLoadKg; }

    public int getFuelPercentage() { return fuelPercentage; }
    public void setFuelPercentage(int fuelPercentage) { this.fuelPercentage = fuelPercentage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getLastMaintenance() { return lastMaintenance; }
    public void setLastMaintenance(String lastMaintenance) { this.lastMaintenance = lastMaintenance; }
}
