package com.skillscape.backend_new.controller; 

import com.skillscape.backend_new.dto.LoginRequest;
import com.skillscape.backend_new.dto.SignupRequest;
import com.skillscape.backend_new.dto.JwtResponse;
import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.repository.UserRepository;
import com.skillscape.backend_new.security.JwtUtils;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600) 
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        // We need to fetch our UserEntity to get the ID and displayName
        UserEntity userEntity = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Error: User not found after authentication."));


        return ResponseEntity.ok(new JwtResponse(jwt,
                                                 userEntity.getId(),
                                                 userEntity.getEmail(),
                                                 userEntity.getDisplayName()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        UserEntity user = new UserEntity();
        user.setDisplayName(signUpRequest.getDisplayName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signUpRequest.getEmail(), signUpRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserEntity savedUser = userRepository.findByEmail(signUpRequest.getEmail())
                                .orElseThrow(() -> new RuntimeException("Error: User not found after saving."));


        return ResponseEntity.ok(new JwtResponse(jwt,
                                                 savedUser.getId(),
                                                 savedUser.getEmail(),
                                                 savedUser.getDisplayName()));
    }
}