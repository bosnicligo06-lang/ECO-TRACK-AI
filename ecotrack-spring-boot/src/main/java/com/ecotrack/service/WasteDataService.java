package com.ecotrack.service;

import com.ecotrack.model.AuditLog;
import com.ecotrack.model.WasteDataEntry;
import com.ecotrack.repository.AuditLogRepository;
import com.ecotrack.repository.WasteDataEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class WasteDataService {

    @Autowired
    private WasteDataEntryRepository wasteDataEntryRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public List<WasteDataEntry> getAllEntries() {
        return wasteDataEntryRepository.findAllByOrderByCreatedAtDesc();
    }

    public WasteDataEntry saveEntry(String date, String location, int wetKg, int dryKg, int hazardousKg, String remarks, String enteredBy) {
        String id = "WST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        WasteDataEntry entry = new WasteDataEntry(id, date, location, wetKg, dryKg, hazardousKg, remarks, enteredBy);
        wasteDataEntryRepository.save(entry);

        AuditLog log = new AuditLog(
                "AUD-WST-" + UUID.randomUUID().toString().substring(0, 6),
                "USR-SEG-01",
                enteredBy != null ? enteredBy : "Kavitha Sundaram",
                "SEGREGATION_USER",
                "WASTE_DATA_ENTRY",
                "WasteDataEntry",
                id,
                "Recorded " + entry.getTotalKg() + "kg at " + location + " (" + wetKg + "kg wet, " + dryKg + "kg dry, " + hazardousKg + "kg hazardous)"
        );
        auditLogRepository.save(log);

        return entry;
    }

    public Map<String, Object> getMetrics() {
        List<WasteDataEntry> entries = wasteDataEntryRepository.findAll();
        int totalWet = entries.stream().mapToInt(WasteDataEntry::getWetKg).sum();
        int totalDry = entries.stream().mapToInt(WasteDataEntry::getDryKg).sum();
        int totalHazardous = entries.stream().mapToInt(WasteDataEntry::getHazardousKg).sum();
        int grandTotal = totalWet + totalDry + totalHazardous;

        double wetPercent = grandTotal > 0 ? ((double) totalWet / grandTotal) * 100.0 : 0.0;
        double dryPercent = grandTotal > 0 ? ((double) totalDry / grandTotal) * 100.0 : 0.0;
        double hazPercent = grandTotal > 0 ? ((double) totalHazardous / grandTotal) * 100.0 : 0.0;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("grandTotal", grandTotal);
        metrics.put("totalWet", totalWet);
        metrics.put("wetPercent", String.format(Locale.US, "%.1f", wetPercent));
        metrics.put("totalDry", totalDry);
        metrics.put("dryPercent", String.format(Locale.US, "%.1f", dryPercent));
        metrics.put("totalHazardous", totalHazardous);
        metrics.put("hazPercent", String.format(Locale.US, "%.1f", hazPercent));
        return metrics;
    }
}
