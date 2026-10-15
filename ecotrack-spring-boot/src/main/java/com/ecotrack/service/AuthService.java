package com.ecotrack.service;

import com.ecotrack.model.User;
import com.ecotrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> authenticate(String identifier, String password) {
        if (identifier == null || password == null) return Optional.empty();

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(identifier.trim());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameIgnoreCase(identifier.trim());
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (password.trim().equals(user.getPassword())) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
}
