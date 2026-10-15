package com.ecotrack.repository;

import com.ecotrack.model.Dustbin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DustbinRepository extends JpaRepository<Dustbin, String> {
    List<Dustbin> findByStatus(String status);
    List<Dustbin> findByWard(String ward);
}
