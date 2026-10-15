package com.ecotrack.repository;

import com.ecotrack.model.PickupTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PickupTaskRepository extends JpaRepository<PickupTask, String> {
    List<PickupTask> findByDriverId(String driverId);
    List<PickupTask> findByTruckId(String truckId);
    List<PickupTask> findByStatus(String status);
    List<PickupTask> findAllByOrderByCreatedAtDesc();
}
