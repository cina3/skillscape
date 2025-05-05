package com.skillscape.backend.auth.controller;

import com.skillscape.backend.service.PasswordResetService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordResetService resetService;

    public PasswordResetController(PasswordResetService resetService) {
        this.resetService = resetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
        @Valid @RequestBody ForgotRequest req
    ) {
        String token = resetService.createToken(req.getEmail());
        // TODO: send the token via email to the user
        System.out.println("Password reset token for " + req.getEmail() + ": " + token);
        return ResponseEntity.ok("Password reset token generated");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
        @Valid @RequestBody ResetRequest req
    ) {
        resetService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok("Password has been reset");
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