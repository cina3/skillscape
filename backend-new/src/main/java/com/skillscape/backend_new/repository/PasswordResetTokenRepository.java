package com.skillscape.backend_new.repository;

import com.skillscape.backend_new.model.PasswordResetToken;
import com.skillscape.backend_new.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUser(UserEntity user);

    void deleteByToken(String token); 
}