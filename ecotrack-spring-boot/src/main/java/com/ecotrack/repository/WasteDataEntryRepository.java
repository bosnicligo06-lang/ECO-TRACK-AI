package com.ecotrack.repository;

import com.ecotrack.model.WasteDataEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WasteDataEntryRepository extends JpaRepository<WasteDataEntry, String> {
    List<WasteDataEntry> findAllByOrderByCreatedAtDesc();
}
