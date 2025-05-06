package com.skillscape.backend.auth.controller;

import com.skillscape.backend.service.PasswordResetService;
import com.skillscape.backend.service.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordResetService resetService;
    private final EmailService         emailService;

    public PasswordResetController(PasswordResetService resetService,
                                   EmailService emailService) {
        this.resetService = resetService;
        this.emailService = emailService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
        @Valid @RequestBody ForgotRequest req
    ) {
        String token = resetService.createToken(req.getEmail());
        String url   = "https://frontend.example.com/reset-password?token=" + token;

        emailService.sendResetLink(req.getEmail(), url);

        return ResponseEntity.ok("Password‑reset instructions have been emailed.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
        @Valid @RequestBody ResetRequest req
    ) {
        resetService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok("Password has been reset.");
    }

    @Data
    public static class ForgotRequest {
        @Email @NotBlank
        private String email;
    }

    @Data
    public static class ResetRequest {
        @NotBlank
        private String token;
        @NotBlank
        private String newPassword;
    }
}