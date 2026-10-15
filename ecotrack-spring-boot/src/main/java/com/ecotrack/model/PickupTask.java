package com.ecotrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pickup_tasks")
public class PickupTask {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "bin_id", length = 50)
    private String binId;

    @Column(name = "truck_id", nullable = false, length = 50)
    private String truckId;

    @Column(name = "driver_id", nullable = false, length = 50)
    private String driverId;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(name = "waste_type", nullable = false, length = 50)
    private String wasteType;

    @Column(name = "estimated_weight_kg", nullable = false)
    private int estimatedWeightKg;

    @Column(nullable = false, length = 50)
    private String priority; // Normal, High, Urgent

    @Column(nullable = false, length = 50)
    private String status; // Assigned, En Route, Completed, Cancelled

    @Column(name = "assigned_by", length = 150)
    private String assignedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "completed_at", length = 100)
    private String completedAt;

    public PickupTask() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBinId() { return binId; }
    public void setBinId(String binId) { this.binId = binId; }

    public String getTruckId() { return truckId; }
    public void setTruckId(String truckId) { this.truckId = truckId; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWasteType() { return wasteType; }
    public void setWasteType(String wasteType) { this.wasteType = wasteType; }

    public int getEstimatedWeightKg() { return estimatedWeightKg; }
    public void setEstimatedWeightKg(int estimatedWeightKg) { this.estimatedWeightKg = estimatedWeightKg; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
}
