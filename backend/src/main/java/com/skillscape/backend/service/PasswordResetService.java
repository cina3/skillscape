package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.PasswordResetToken;
import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.PasswordResetTokenRepository;
import com.skillscape.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class PasswordResetService {
    private final PasswordResetTokenRepository tokenRepo;
    private final UserRepository              userRepo;
    private final UserService                 userService;  

    public PasswordResetService(PasswordResetTokenRepository tokenRepo,
                                UserRepository userRepo,
                                UserService userService) {
        this.tokenRepo  = tokenRepo;
        this.userRepo   = userRepo;
        this.userService = userService;
    }

    public String createToken(String email) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));

            tokenRepo.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken prt = PasswordResetToken.builder()
            .token(token)
            .user(user)
            .expiresAt(LocalDateTime.now().plusHours(1))
            .build();
        tokenRepo.save(prt);
        return token;
    }
    
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = tokenRepo.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expired");
        }

        userService.changePassword(prt.getUser().getId(), newPassword);

        tokenRepo.delete(prt);
    }
}