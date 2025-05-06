package com.skillscape.backend.auth.controller;

import com.skillscape.backend.auth.jwt.JwtResponse;
import com.skillscape.backend.auth.jwt.JwtUtils;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.UserService;
import com.skillscape.backend.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.Data;
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
    private final PasswordResetService resetService;

    public AuthController(AuthenticationManager authManager,
                          JwtUtils jwtUtils,
                          UserService userService,
                          PasswordResetService resetService) {
        this.authManager = authManager;
        this.jwtUtils    = jwtUtils;
        this.userService = userService;
        this.resetService = resetService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        User user = userService.register(
            req.getDisplayName(),
            req.getEmail(),
            req.getPassword());

        String token = jwtUtils.generateToken(user.getEmail());
        return ResponseEntity.status(201).body(new JwtResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    req.getEmail(), req.getPassword()));
            String token = jwtUtils.generateToken(req.getEmail());
            return ResponseEntity.ok(new JwtResponse(token));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgot(@Valid @RequestBody ForgotRequest req) {
        String token = resetService.createToken(req.getEmail());
        return ResponseEntity.ok("Reset token (dev): " + token);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> reset(@Valid @RequestBody ResetRequest req) {
        resetService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok("Password updated");
    }

    @Data public static class RegisterRequest {
        private String displayName;
        private String email;
        private String password;
    }
    @Data public static class LoginRequest   { private String email; private String password; }
    @Data public static class ForgotRequest  { private String email; }
    @Data public static class ResetRequest   { private String token; private String newPassword; }
}