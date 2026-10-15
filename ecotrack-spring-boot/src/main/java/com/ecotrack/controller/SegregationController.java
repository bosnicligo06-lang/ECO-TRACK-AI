package com.ecotrack.controller;

import com.ecotrack.model.User;
import com.ecotrack.model.WasteDataEntry;
import com.ecotrack.service.WasteDataService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/segregation")
public class SegregationController {

    @Autowired
    private WasteDataService wasteDataService;

    @GetMapping
    public String segregationDashboard(
            @RequestParam(value = "tab", defaultValue = "dashboard") String tab,
            HttpSession session,
            Model model
    ) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null) {
            return "redirect:/login";
        }
        if (!"SEGREGATION_USER".equalsIgnoreCase(currentUser.getRole()) && !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return "redirect:/login";
        }

        List<WasteDataEntry> entries = wasteDataService.getAllEntries();
        Map<String, Object> metrics = wasteDataService.getMetrics();

        model.addAttribute("currentUser", currentUser);
        model.addAttribute("activeTab", tab);
        model.addAttribute("entries", entries);
        model.addAttribute("metrics", metrics);
        model.addAttribute("todayDate", LocalDate.now().toString());

        return "segregation-dashboard";
    }

    @PostMapping("/enter-waste")
    public String enterWasteData(
            @RequestParam("date") String date,
            @RequestParam("location") String location,
            @RequestParam("wetKg") int wetKg,
            @RequestParam("dryKg") int dryKg,
            @RequestParam("hazardousKg") int hazardousKg,
            @RequestParam(value = "remarks", defaultValue = "") String remarks,
            HttpSession session,
            RedirectAttributes redirectAttributes
    ) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null) return "redirect:/login";

        WasteDataEntry entry = wasteDataService.saveEntry(
                date,
                location,
                wetKg,
                dryKg,
                hazardousKg,
                remarks,
                currentUser.getFullName()
        );

        redirectAttributes.addFlashAttribute("successToast", "Waste data saved successfully. Recorded " + entry.getTotalKg() + " kg for " + entry.getLocation());
        return "redirect:/segregation?tab=dashboard";
    }
}
