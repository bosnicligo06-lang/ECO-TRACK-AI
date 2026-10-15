package com.ecotrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ward_complaints")
public class WardComplaint {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "citizen_name", nullable = false, length = 150)
    private String citizenName;

    @Column(name = "citizen_phone", nullable = false, length = 50)
    private String citizenPhone;

    @Column(nullable = false, length = 100)
    private String ward;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "waste_type", nullable = false, length = 50)
    private String wasteType;

    @Column(name = "estimated_weight_kg", nullable = false)
    private int estimatedWeightKg;

    @Column(nullable = false, length = 50)
    private String priority; // Normal, High, Urgent

    @Column(nullable = false, length = 50)
    private String status; // Pending Manual Assignment, Manually Assigned, Resolved

    @Column(nullable = false, length = 50)
    private String source; // Email, Call

    @Column(length = 150)
    private String email;

    @Column(name = "assigned_driver_id", length = 50)
    private String assignedDriverId;

    @Column(name = "assigned_truck_id", length = 50)
    private String assignedTruckId;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public WardComplaint() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public String getCitizenPhone() { return citizenPhone; }
    public void setCitizenPhone(String citizenPhone) { this.citizenPhone = citizenPhone; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getWasteType() { return wasteType; }
    public void setWasteType(String wasteType) { this.wasteType = wasteType; }

    public int getEstimatedWeightKg() { return estimatedWeightKg; }
    public void setEstimatedWeightKg(int estimatedWeightKg) { this.estimatedWeightKg = estimatedWeightKg; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAssignedDriverId() { return assignedDriverId; }
    public void setAssignedDriverId(String assignedDriverId) { this.assignedDriverId = assignedDriverId; }

    public String getAssignedTruckId() { return assignedTruckId; }
    public void setAssignedTruckId(String assignedTruckId) { this.assignedTruckId = assignedTruckId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
