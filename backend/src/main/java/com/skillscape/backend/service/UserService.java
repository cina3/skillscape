package com.skillscape.backend.service;

import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(
        String displayName, 
        String email, 
        String rawPassword
    ) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use: " + email);
        }

        String hashed = passwordEncoder.encode(rawPassword);
        User user = User.builder()
                        .displayName(displayName)
                        .email(email)
                        .password(hashed)
                        .build();
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateDisplayName(Long userId, String displayName) {
        User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("No user with id " + userId));
        user.setDisplayName(displayName);
        return userRepository.save(user);
    }
}