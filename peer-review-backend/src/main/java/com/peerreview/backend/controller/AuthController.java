package com.peerreview.backend.controller;

import com.peerreview.backend.dto.AuthDtos;
import com.peerreview.backend.model.User;
import com.peerreview.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Long ADMIN_ID = 0L;

    private final UserRepository userRepository;
    private final String adminName;
    private final String adminEmail;
    private final String adminPassword;

    public AuthController(
            UserRepository userRepository,
            @Value("${app.admin.name:Admin}") String adminName,
            @Value("${app.admin.email:admin@example.com}") String adminEmail,
            @Value("${app.admin.password:admin123}") String adminPassword
    ) {
        this.userRepository = userRepository;
        this.adminName = adminName;
        this.adminEmail = adminEmail.trim().toLowerCase();
        this.adminPassword = adminPassword;
    }

    @PostMapping("/register")
    public AuthDtos.RegisterResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        if (request.role() == com.peerreview.backend.model.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin registration is disabled");
        }

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User newUser = new User();
        newUser.setEmail(request.email().trim().toLowerCase());
        newUser.setPassword(request.password());
        newUser.setName(request.name().trim());
        newUser.setRole(request.role());

        User saved = userRepository.save(newUser);
        AuthDtos.AuthResponse registeredUser = new AuthDtos.AuthResponse(
                saved.getId(),
                saved.getEmail(),
                saved.getName(),
                saved.getRole()
        );
        return new AuthDtos.RegisterResponse("Successfully registered. Please login with the same credentials.", registeredUser);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        String password = request.password();

        if (adminEmail.equalsIgnoreCase(email) && adminPassword.equals(password)) {
            return new AuthDtos.AuthResponse(
                    ADMIN_ID,
                    adminEmail,
                    adminName,
                    com.peerreview.backend.model.Role.ADMIN
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (user.getPassword() == null || !user.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return new AuthDtos.AuthResponse(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }
}
