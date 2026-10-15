package com.ecotrack.controller;

import com.ecotrack.model.User;
import com.ecotrack.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class LoginController {

    @Autowired
    private AuthService authService;

    // On startup, http://localhost:8080/ redirects to LOGIN page first!
    @GetMapping("/")
    public String index(HttpSession session) {
        User user = (User) session.getAttribute("currentUser");
        if (user == null) {
            return "redirect:/login";
        }
        return redirectToPortal(user);
    }

    @GetMapping("/login")
    public String showLoginPage(
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "logout", required = false) String logout,
            Model model,
            HttpSession session
    ) {
        // If already logged in, redirect to respective portal
        User user = (User) session.getAttribute("currentUser");
        if (user != null) {
            return redirectToPortal(user);
        }

        if (error != null) {
            model.addAttribute("errorMessage", "Invalid municipal credentials. Please check your username/email and password.");
        }
        if (logout != null) {
            model.addAttribute("successMessage", "Signed out successfully from municipal session.");
        }

        // Pass demo accounts for one-click authentication
        model.addAttribute("users", authService.getAllUsers());
        return "login";
    }

    @PostMapping("/login")
    public String handleLogin(
            @RequestParam("identifier") String identifier,
            @RequestParam("password") String password,
            HttpSession session,
            Model model
    ) {
        Optional<User> userOpt = authService.authenticate(identifier, password);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            session.setAttribute("currentUser", user);
            return redirectToPortal(user);
        } else {
            model.addAttribute("errorMessage", "Invalid municipal credentials. Please check your username/email and password.");
            model.addAttribute("users", authService.getAllUsers());
            model.addAttribute("enteredIdentifier", identifier);
            return "login";
        }
    }

    @GetMapping("/logout")
    public String handleLogout(HttpSession session) {
        session.invalidate();
        return "redirect:/login?logout=true";
    }

    private String redirectToPortal(User user) {
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            return "redirect:/admin";
        } else if ("DRIVER".equalsIgnoreCase(user.getRole())) {
            return "redirect:/driver";
        } else {
            return "redirect:/segregation";
        }
    }
}
