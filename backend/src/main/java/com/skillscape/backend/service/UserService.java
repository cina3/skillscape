package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.User;
import com.skillscape.backend.model.PasswordResetToken;
import com.skillscape.backend.repository.UserRepository;
import com.skillscape.backend.repository.PasswordResetTokenRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository                   userRepository;
    private final PasswordEncoder                  passwordEncoder;
    private final CoinService                      coinService;
    private final PasswordResetTokenRepository     tokenRepository;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       CoinService coinService,
                       PasswordResetTokenRepository tokenRepository) {
        this.userRepository   = userRepository;
        this.passwordEncoder  = passwordEncoder;
        this.coinService      = coinService;
        this.tokenRepository  = tokenRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                new UsernameNotFoundException("User not found: " + email));
        return org.springframework.security.core
            .userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPassword())
            .authorities(user.getRoles().stream()
                .map(r -> "ROLE_" + r).toArray(String[]::new))
            .build();
    }

    @Transactional
    public User register(String displayName,
                         String email,
                         String rawPassword) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use: " + email);
        }
        String hashed = passwordEncoder.encode(rawPassword);
        User user = User.builder()
                        .displayName(displayName)
                        .email(email)
                        .password(hashed)
                        .roles(new HashSet<>(Set.of("CUSTOMER")))
                        .coinBalance(0)
                        .build();
        user = userRepository.save(user);
        coinService.adjustBalance(user.getId(), 200, "Registration bonus");
        return user;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public User updateDisplayName(Long userId, String displayName) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("No user with id " + userId));
        user.setDisplayName(displayName);
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, String rawPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        user.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        userRepository.delete(user);
    }

    @Transactional
    public void verifyAndChangePassword(String email, String oldPwd, String newPwd) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        if (!passwordEncoder.matches(oldPwd, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPwd));
        userRepository.save(user);
    }

    @Transactional
    public void deleteByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        userRepository.delete(user);
    }

    @Transactional
    public void updateAvatarUrl(Long userId, String url) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        user.setAvatarUrl(url);
        userRepository.save(user);
    }

    @Transactional
    public User upgradeToPremium(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        user.setPremium(true);
        return userRepository.save(user);
    }

    @Transactional
    public User setPremium(Long userId, boolean value) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        user.setPremium(value);
        return userRepository.save(user);
    }

    @Transactional
    public String requestReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                new NotFoundException("User not found: " + email));

        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);

        PasswordResetToken prt = tokenRepository.findByUser(user)
            .orElse(PasswordResetToken.builder().build());
        prt.setUser(user);
        prt.setToken(token);
        prt.setExpiresAt(expiresAt);
        tokenRepository.save(prt);

        return token;
    }

    @Transactional
    public void resetPassword(String token, String newRawPassword) {
        PasswordResetToken prt = tokenRepository.findByToken(token)
            .orElseThrow(() ->
                new IllegalArgumentException("Invalid reset token"));

        if (prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        User user = prt.getUser();
        user.setPassword(passwordEncoder.encode(newRawPassword));
        userRepository.save(user);

        tokenRepository.delete(prt);
    }
}