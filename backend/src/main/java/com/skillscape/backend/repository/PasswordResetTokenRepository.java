package com.skillscape.backend.repository;

import com.skillscape.backend.model.PasswordResetToken;
import com.skillscape.backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

            Optional<PasswordResetToken> findByToken(String token);
            Optional<PasswordResetToken> findByUser(User user);
    void deleteByUserId(Long userId);
    void deleteByUser(User user);       
}