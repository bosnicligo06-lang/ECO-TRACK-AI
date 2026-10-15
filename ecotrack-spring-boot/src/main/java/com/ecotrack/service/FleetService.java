package com.ecotrack.service;

import com.ecotrack.model.Truck;
import com.ecotrack.model.Dustbin;
import com.ecotrack.repository.TruckRepository;
import com.ecotrack.repository.DustbinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FleetService {

    @Autowired
    private TruckRepository truckRepository;

    @Autowired
    private DustbinRepository dustbinRepository;

    public List<Truck> getAllTrucks() {
        return truckRepository.findAll();
    }

    public Optional<Truck> getTruckById(String id) {
        return truckRepository.findById(id);
    }

    public List<Dustbin> getAllDustbins() {
        return dustbinRepository.findAll();
    }

    public Optional<Dustbin> getDustbinById(String id) {
        return dustbinRepository.findById(id);
    }
}
