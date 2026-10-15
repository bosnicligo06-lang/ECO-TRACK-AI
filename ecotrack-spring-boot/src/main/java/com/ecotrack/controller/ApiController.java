package com.ecotrack.controller;

import com.ecotrack.model.Truck;
import com.ecotrack.model.WasteDataEntry;
import com.ecotrack.repository.TruckRepository;
import com.ecotrack.service.WasteDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    @Autowired
    private TruckRepository truckRepository;

    @Autowired
    private WasteDataService wasteDataService;

    @GetMapping("/trucks")
    public List<Truck> getTrucks() {
        return truckRepository.findAll();
    }

    @GetMapping("/waste-metrics")
    public Map<String, Object> getWasteMetrics() {
        return wasteDataService.getMetrics();
    }

    @GetMapping("/waste-entries")
    public List<WasteDataEntry> getWasteEntries() {
        return wasteDataService.getAllEntries();
    }

    @PostMapping("/waste-entries")
    public ResponseEntity<WasteDataEntry> createWasteEntry(@RequestBody Map<String, Object> payload) {
        String date = (String) payload.getOrDefault("date", java.time.LocalDate.now().toString());
        String location = (String) payload.getOrDefault("location", "Chennai Center");
        int wetKg = Integer.parseInt(payload.getOrDefault("wetKg", 0).toString());
        int dryKg = Integer.parseInt(payload.getOrDefault("dryKg", 0).toString());
        int hazardousKg = Integer.parseInt(payload.getOrDefault("hazardousKg", 0).toString());
        String remarks = (String) payload.getOrDefault("remarks", "");
        String enteredBy = (String) payload.getOrDefault("enteredBy", "Segregation Officer");

        WasteDataEntry entry = wasteDataService.saveEntry(date, location, wetKg, dryKg, hazardousKg, remarks, enteredBy);
        return ResponseEntity.ok(entry);
    }
}
