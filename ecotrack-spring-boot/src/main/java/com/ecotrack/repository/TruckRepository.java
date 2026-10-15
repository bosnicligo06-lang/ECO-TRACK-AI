package com.ecotrack.repository;

import com.ecotrack.model.Truck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TruckRepository extends JpaRepository<Truck, String> {
    List<Truck> findByStatus(String status);
}
