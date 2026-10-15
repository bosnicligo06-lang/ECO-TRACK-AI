package com.ecotrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "dustbins")
public class Dustbin {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false, length = 100)
    private String ward;

    @Column(nullable = false, length = 100)
    private String zone;

    @Column(name = "fill_percentage", nullable = false)
    private int fillPercentage;

    @Column(name = "weight_kg", nullable = false)
    private int weightKg;

    @Column(name = "smell_level", length = 50)
    private String smellLevel;

    @Column(name = "waste_type", length = 50)
    private String wasteType;

    @Column(nullable = false, length = 50)
    private String status; // NORMAL, WARNING, CRITICAL

    private Double latitude;
    private Double longitude;

    @Column(name = "last_emptied", length = 100)
    private String lastEmptied;

    public Dustbin() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public int getFillPercentage() { return fillPercentage; }
    public void setFillPercentage(int fillPercentage) { this.fillPercentage = fillPercentage; }

    public int getWeightKg() { return weightKg; }
    public void setWeightKg(int weightKg) { this.weightKg = weightKg; }

    public String getSmellLevel() { return smellLevel; }
    public void setSmellLevel(String smellLevel) { this.smellLevel = smellLevel; }

    public String getWasteType() { return wasteType; }
    public void setWasteType(String wasteType) { this.wasteType = wasteType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getLastEmptied() { return lastEmptied; }
    public void setLastEmptied(String lastEmptied) { this.lastEmptied = lastEmptied; }
}
