package com.ecotrack.service;

import com.ecotrack.model.*;
import com.ecotrack.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AllocationService {

    @Autowired
    private PickupTaskRepository taskRepository;

    @Autowired
    private TruckRepository truckRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WardComplaintRepository complaintRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public PickupTask assignManualTask(
            String complaintId,
            String driverId,
            String truckId,
            String location,
            String wasteType,
            int estimatedWeightKg,
            String priority,
            String timeWindow,
            String instructions,
            String adminName
    ) {
        // 1. Fetch Truck & Validate remaining safe capacity
        Truck truck = truckRepository.findById(truckId)
                .orElseThrow(() -> new IllegalArgumentException("Truck not found: " + truckId));

        int remainingCapacity = truck.getMaxCapacityKg() - truck.getCurrentLoadKg();
        if (estimatedWeightKg > remainingCapacity) {
            throw new IllegalStateException("Insufficient capacity: Truck has " + remainingCapacity + " kg remaining, requires " + estimatedWeightKg + " kg.");
        }

        // 2. Fetch Driver
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found: " + driverId));

        // 3. Create New Pickup Task
        String taskId = "TSK-MAN-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        PickupTask task = new PickupTask();
        task.setId(taskId);
        task.setTruckId(truck.getId());
        task.setDriverId(driver.getId());
        task.setLocation(location);
        task.setWasteType(wasteType);
        task.setEstimatedWeightKg(estimatedWeightKg);
        task.setPriority(priority);
        task.setStatus("Assigned");
        task.setAssignedBy(adminName);
        task.setNotes("Window: " + timeWindow + " | Instructions: " + instructions);
        task.setCreatedAt(LocalDateTime.now());
        taskRepository.save(task);

        // 4. Update Truck Load (deduct from remaining capacity)
        truck.setCurrentLoadKg(truck.getCurrentLoadKg() + estimatedWeightKg);
        if (truck.getCurrentLoadKg() >= truck.getMaxCapacityKg()) {
            truck.setStatus("FULL");
        } else {
            truck.setStatus("COLLECTING");
        }
        truckRepository.save(truck);

        // 5. Update Original Incoming Notification / Complaint if present
        if (complaintId != null && !complaintId.trim().isEmpty()) {
            Optional<WardComplaint> complaintOpt = complaintRepository.findById(complaintId);
            if (complaintOpt.isPresent()) {
                WardComplaint complaint = complaintOpt.get();
                complaint.setStatus("Manually Assigned");
                complaint.setAssignedDriverId(driver.getId());
                complaint.setAssignedTruckId(truck.getId());
                complaintRepository.save(complaint);
            }
        }

        // 6. Record in Audit Log
        AuditLog log = new AuditLog(
                "AUD-MAN-" + UUID.randomUUID().toString().substring(0, 6),
                "USR-ADM-01",
                adminName,
                "ADMIN",
                "MANUAL_ALLOCATION",
                "PickupTask",
                taskId,
                "Assigned " + estimatedWeightKg + "kg (" + wasteType + ") at " + location + " to " + driver.getFullName() + " [" + truck.getId() + "]"
        );
        auditLogRepository.save(log);

        return task;
    }

    @Transactional
    public void cancelTask(String taskId, String adminName) {
        PickupTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        task.setStatus("Cancelled");
        taskRepository.save(task);

        // Refund capacity to truck
        Optional<Truck> truckOpt = truckRepository.findById(task.getTruckId());
        if (truckOpt.isPresent()) {
            Truck truck = truckOpt.get();
            truck.setCurrentLoadKg(Math.max(0, truck.getCurrentLoadKg() - task.getEstimatedWeightKg()));
            truckRepository.save(truck);
        }

        AuditLog log = new AuditLog(
                "AUD-CNC-" + UUID.randomUUID().toString().substring(0, 6),
                "USR-ADM-01",
                adminName,
                "ADMIN",
                "TASK_CANCELLED",
                "PickupTask",
                taskId,
                "Cancelled task " + taskId + " and restored " + task.getEstimatedWeightKg() + "kg capacity to " + task.getTruckId()
        );
        auditLogRepository.save(log);
    }
}
