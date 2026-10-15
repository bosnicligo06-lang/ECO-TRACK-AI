package com.ecotrack.repository;

import com.ecotrack.model.WardComplaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WardComplaintRepository extends JpaRepository<WardComplaint, String> {
    List<WardComplaint> findByStatus(String status);
    List<WardComplaint> findAllByOrderByCreatedAtDesc();
}
