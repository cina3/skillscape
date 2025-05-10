package com.skillscape.backend_new.service;

import com.skillscape.backend_new.model.PasswordResetToken;
import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.repository.PasswordResetTokenRepository;
import com.skillscape.backend_new.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, 
                       PasswordResetTokenRepository passwordResetTokenRepository, 
                       @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                userEntity.getEmail(),
                userEntity.getPassword(),
                new ArrayList<>() 
        );
    }

    @Transactional
    public Optional<UserEntity> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public String createPasswordResetTokenForUser(UserEntity user) {
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

        String token = UUID.randomUUID().toString();
        PasswordResetToken myToken = new PasswordResetToken(token, user);
        passwordResetTokenRepository.save(myToken);
        return token;
    }

    @Transactional(readOnly = true)
    public Optional<UserEntity> getUserByPasswordResetToken(String token) {
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token);
        if (tokenOpt.isPresent()) {
            PasswordResetToken passToken = tokenOpt.get();
            if (passToken.isExpired()) {
                return Optional.empty(); 
            }
            return Optional.of(passToken.getUser());
        }
        return Optional.empty(); 
    }

    @Transactional
    public void changeUserPassword(UserEntity user, String newPassword) {
        user.setPassword(this.passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);
    }

    @Transactional
    public void deletePasswordResetToken(String token) {
        passwordResetTokenRepository.deleteByToken(token);
    }
}