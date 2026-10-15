package com.ecotrack.controller;

import com.ecotrack.model.*;
import com.ecotrack.repository.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/driver")
public class DriverController {

    @Autowired
    private TruckRepository truckRepository;

    @Autowired
    private PickupTaskRepository pickupTaskRepository;

    @Autowired
    private DustbinRepository dustbinRepository;

    @Autowired
    private DeviceAlertRepository alertRepository;

    @GetMapping
    public String driverDashboard(
            @RequestParam(value = "tab", defaultValue = "dashboard") String tab,
            HttpSession session,
            Model model
    ) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null) {
            return "redirect:/login";
        }
        if (!"DRIVER".equalsIgnoreCase(currentUser.getRole())) {
            return "redirect:/login";
        }

        Truck truck = truckRepository.findById(currentUser.getAssignedTruckId() != null ? currentUser.getAssignedTruckId() : "TRUCK-500").orElse(null);
        List<PickupTask> myTasks = pickupTaskRepository.findByDriverId(currentUser.getId());
        if (myTasks.isEmpty() && truck != null) {
            myTasks = pickupTaskRepository.findByTruckId(truck.getId());
        }

        long pendingStops = myTasks.stream().filter(t -> !"Completed".equalsIgnoreCase(t.getStatus())).count();
        List<Dustbin> bins = dustbinRepository.findAll();
        List<DeviceAlert> alerts = alertRepository.findByAcknowledgedFalseOrderByCreatedAtDesc();

        model.addAttribute("currentUser", currentUser);
        model.addAttribute("activeTab", tab);
        model.addAttribute("truck", truck);
        model.addAttribute("myTasks", myTasks);
        model.addAttribute("pendingStops", pendingStops);
        model.addAttribute("bins", bins);
        model.addAttribute("alerts", alerts);

        return "driver-dashboard";
    }

    @PostMapping("/complete-pickup")
    public String completePickup(
            @RequestParam("taskId") String taskId,
            HttpSession session,
            RedirectAttributes redirectAttributes
    ) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null) return "redirect:/login";

        PickupTask task = pickupTaskRepository.findById(taskId).orElse(null);
        if (task != null) {
            task.setStatus("Completed");
            task.setCompletedAt(java.time.LocalDateTime.now().toString());
            pickupTaskRepository.save(task);
            redirectAttributes.addFlashAttribute("successToast", "Stop marked completed at " + task.getLocation());
        }
        return "redirect:/driver?tab=pickups";
    }
}
