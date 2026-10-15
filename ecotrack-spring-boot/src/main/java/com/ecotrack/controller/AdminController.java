package com.ecotrack.controller;

import com.ecotrack.model.*;
import com.ecotrack.repository.*;
import com.ecotrack.service.AllocationService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.UUID;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private TruckRepository truckRepository;

    @Autowired
    private DustbinRepository dustbinRepository;

    @Autowired
    private PickupTaskRepository pickupTaskRepository;

    @Autowired
    private WardComplaintRepository wardComplaintRepository;

    @Autowired
    private DeviceAlertRepository alertRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AllocationService allocationService;

    @GetMapping
    public String adminDashboard(
            @RequestParam(value = "tab", defaultValue = "overview") String tab,
            HttpSession session,
            Model model
    ) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null) {
            return "redirect:/login";
        }
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return "redirect:/login";
        }

        List<Truck> trucks = truckRepository.findAll();
        List<Dustbin> bins = dustbinRepository.findAll();
        List<PickupTask> tasks = pickupTaskRepository.findAllByOrderByCreatedAtDesc();
        List<WardComplaint> complaints = wardComplaintRepository.findAllByOrderByCreatedAtDesc();
        List<DeviceAlert> alerts = alertRepository.findByAcknowledgedFalseOrderByCreatedAtDesc();
        List<AuditLog> auditLogs = auditLogRepository.findAllByOrderByTimestampDesc();
        List<User> drivers = userRepository.findByRole("DRIVER");

        // Filter incoming requests (Pending Manual Assignment)
        List<WardComplaint> incomingRequests = complaints.stream()
                .filter(c -> "Pending Manual Assignment".equalsIgnoreCase(c.getStatus()))
                .toList();

        // Currently assigned manual tasks
        List<PickupTask> assignedTasks = tasks.stream()
                .filter(t -> t.getNotes() != null && t.getNotes().contains("Window:"))
                .toList();
        if (assignedTasks.isEmpty()) {
            assignedTasks = tasks;
        }

        model.addAttribute("currentUser", currentUser);
        model.addAttribute("activeTab", tab);
        model.addAttribute("trucks", trucks);
        model.addAttribute("bins", bins);
        model.addAttribute("tasks", tasks);
        model.addAttribute("complaints", complaints);
        model.addAttribute("incomingRequests", incomingRequests);
        model.addAttribute("assignedTasks", assignedTasks);
        model.addAttribute("alerts", alerts);
        model.addAttribute("auditLogs", auditLogs);
        model.addAttribute("drivers", drivers);

        return "admin-dashboard";
    }

    @PostMapping("/assign-manual")
    public String assignManual(
            @RequestParam(value = "complaintId", required = false) String complaintId,
            @RequestParam("driverId") String driverId,
            @RequestParam("truckId") String truckId,
            @RequestParam("location") String location,
            @RequestParam("wasteType") String wasteType,
            @RequestParam("estimatedWeightKg") int estimatedWeightKg,
            @RequestParam("priority") String priority,
            @RequestParam(value = "timeWindow", defaultValue = "Within 2 Hours") String timeWindow,
            @RequestParam(value = "instructions", defaultValue = "") String instructions,
            HttpSession session,
            RedirectAttributes redirectAttributes
    ) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null) return "redirect:/login";

        try {
            PickupTask task = allocationService.assignManualTask(
                    complaintId,
                    driverId,
                    truckId,
                    location,
                    wasteType,
                    estimatedWeightKg,
                    priority,
                    timeWindow,
                    instructions,
                    currentUser.getFullName()
            );

            Truck truck = truckRepository.findById(truckId).orElse(null);
            User driver = userRepository.findById(driverId).orElse(null);
            String driverName = driver != null ? driver.getFullName() : driverId;

            redirectAttributes.addFlashAttribute("successToast", "Task successfully assigned to " + driverName + " – " + truckId);
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("errorToast", ex.getMessage());
        }

        return "redirect:/admin?tab=manual-allocation";
    }

    @PostMapping("/cancel-task")
    public String cancelTask(
            @RequestParam("taskId") String taskId,
            HttpSession session,
            RedirectAttributes redirectAttributes
    ) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null) return "redirect:/login";

        try {
            allocationService.cancelTask(taskId, currentUser.getFullName());
            redirectAttributes.addFlashAttribute("successToast", "Task " + taskId + " cancelled and truck capacity restored.");
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("errorToast", ex.getMessage());
        }

        return "redirect:/admin?tab=manual-allocation";
    }

    @PostMapping("/add-call-request")
    public String addCallRequest(
            @RequestParam("citizenName") String citizenName,
            @RequestParam("citizenPhone") String citizenPhone,
            @RequestParam("ward") String ward,
            @RequestParam("address") String address,
            @RequestParam("wasteType") String wasteType,
            @RequestParam("estimatedWeightKg") int estimatedWeightKg,
            @RequestParam("priority") String priority,
            RedirectAttributes redirectAttributes
    ) {
        WardComplaint complaint = new WardComplaint();
        complaint.setId("CALL-1913-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        complaint.setCitizenName(citizenName);
        complaint.setCitizenPhone(citizenPhone);
        complaint.setWard(ward);
        complaint.setAddress(address);
        complaint.setWasteType(wasteType);
        complaint.setEstimatedWeightKg(estimatedWeightKg);
        complaint.setPriority(priority);
        complaint.setStatus("Pending Manual Assignment");
        complaint.setSource("Call");
        wardComplaintRepository.save(complaint);

        redirectAttributes.addFlashAttribute("successToast", "Incoming call request registered via Control Room (1913). Ready for manual assignment.");
        return "redirect:/admin?tab=manual-allocation";
    }
}
