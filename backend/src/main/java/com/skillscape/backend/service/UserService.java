package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Set;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository   userRepository;
    private final PasswordEncoder  passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
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
                        .roles(Set.of("CUSTOMER"))  
                        .build();
        return userRepository.save(user);
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
}