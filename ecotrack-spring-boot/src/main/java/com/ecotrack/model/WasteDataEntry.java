package com.ecotrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "waste_data_entries")
public class WasteDataEntry {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "entry_date", nullable = false, length = 50)
    private String date;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(name = "wet_kg", nullable = false)
    private int wetKg;

    @Column(name = "dry_kg", nullable = false)
    private int dryKg;

    @Column(name = "hazardous_kg", nullable = false)
    private int hazardousKg;

    @Column(name = "total_kg", nullable = false)
    private int totalKg;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "entered_by", length = 150)
    private String enteredBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public WasteDataEntry() {}

    public WasteDataEntry(String id, String date, String location, int wetKg, int dryKg, int hazardousKg, String remarks, String enteredBy) {
        this.id = id;
        this.date = date;
        this.location = location;
        this.wetKg = wetKg;
        this.dryKg = dryKg;
        this.hazardousKg = hazardousKg;
        this.totalKg = wetKg + dryKg + hazardousKg;
        this.remarks = remarks;
        this.enteredBy = enteredBy;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public int getWetKg() { return wetKg; }
    public void setWetKg(int wetKg) { 
        this.wetKg = wetKg; 
        this.totalKg = this.wetKg + this.dryKg + this.hazardousKg;
    }

    public int getDryKg() { return dryKg; }
    public void setDryKg(int dryKg) { 
        this.dryKg = dryKg; 
        this.totalKg = this.wetKg + this.dryKg + this.hazardousKg;
    }

    public int getHazardousKg() { return hazardousKg; }
    public void setHazardousKg(int hazardousKg) { 
        this.hazardousKg = hazardousKg; 
        this.totalKg = this.wetKg + this.dryKg + this.hazardousKg;
    }

    public int getTotalKg() { return totalKg; }
    public void setTotalKg(int totalKg) { this.totalKg = totalKg; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getEnteredBy() { return enteredBy; }
    public void setEnteredBy(String enteredBy) { this.enteredBy = enteredBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
