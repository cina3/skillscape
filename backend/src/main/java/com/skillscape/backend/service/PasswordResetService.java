// src/main/java/com/skillscape/backend/service/PasswordResetService.java
package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.PasswordResetToken;
import com.skillscape.backend.repository.PasswordResetTokenRepository;
import com.skillscape.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepo;
    private final UserRepository               userRepo;
    private final PasswordEncoder              passwordEncoder;

    @Transactional
    public String createToken(String email) {
        var user = userRepo.findByEmail(email)
                 .orElseThrow(() -> new NotFoundException("No account for " + email));

        tokenRepo.deleteByUserId(user.getId());    

        String token = UUID.randomUUID().toString();
        tokenRepo.save(PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(2))
                .build());
        return token;
    }

    @Transactional
    public void resetPassword(String token, String newRawPwd) {
        PasswordResetToken prt = tokenRepo.findByToken(token)
            .orElseThrow(() -> new NotFoundException("Invalid token"));

        if (prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expired");
        }
        var user = prt.getUser();
        user.setPassword(passwordEncoder.encode(newRawPwd));
        userRepo.save(user);
        tokenRepo.delete(prt);               
    }
}