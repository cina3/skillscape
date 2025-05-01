package com.skillscape.backend.auth.controller;

import com.skillscape.backend.auth.jwt.JwtResponse;
import com.skillscape.backend.auth.jwt.JwtUtils;
import com.skillscape.backend.dto.*;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final UserService userService;

    public AuthController(AuthenticationManager authManager,
                          JwtUtils jwtUtils,
                          UserService userService) {
        this.authManager = authManager;
        this.jwtUtils    = jwtUtils;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
        @Valid @RequestBody RegisterRequest req
    ) {
        User user = userService.register(
            req.getEmail(), req.getPassword(), req.getDisplayName());
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
        @Valid @RequestBody LoginRequest req
    ) {
        try {
            authManager.authenticate(
              new UsernamePasswordAuthenticationToken(
                req.getEmail(), req.getPassword()));
            String token = jwtUtils.generateToken(req.getEmail());
            return ResponseEntity.ok(new JwtResponse(token));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401)
                                 .body("Invalid credentials");
        }
    }
}