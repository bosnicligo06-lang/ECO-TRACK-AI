package com.ecotrack.repository;

import com.ecotrack.model.DeviceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceAlertRepository extends JpaRepository<DeviceAlert, String> {
    List<DeviceAlert> findByAcknowledgedFalseOrderByCreatedAtDesc();
}
