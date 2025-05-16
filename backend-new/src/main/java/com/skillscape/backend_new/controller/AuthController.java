package com.skillscape.backend_new.controller; 

import com.skillscape.backend_new.dto.ChangePasswordRequest; 
import com.skillscape.backend_new.dto.ForgotPasswordRequest;
import com.skillscape.backend_new.dto.LoginRequest;
import com.skillscape.backend_new.dto.ResetPasswordRequest;
import com.skillscape.backend_new.dto.SignupRequest;
import com.skillscape.backend_new.dto.JwtResponse;
import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.repository.UserRepository;
import com.skillscape.backend_new.security.JwtUtils;
import com.skillscape.backend_new.service.EmailService; 
import com.skillscape.backend_new.service.UserService;  
import com.skillscape.backend_new.service.TokenBlacklistService;

import jakarta.servlet.http.HttpServletRequest; 
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus; 
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

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

    @Autowired
    UserService userService; 

    @Autowired
    EmailService emailService; 

    @Autowired
    TokenBlacklistService tokenBlacklistService; 

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserEntity userEntity = userService.findUserByEmail(loginRequest.getEmail())
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

        UserEntity authenticatedUser = userService.findUserByEmail(signUpRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found after signup and authentication."));

        return ResponseEntity.ok(new JwtResponse(jwt,
                                                 authenticatedUser.getId(),
                                                 authenticatedUser.getEmail(),
                                                 authenticatedUser.getDisplayName()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest, HttpServletRequest request) {
        Optional<UserEntity> userOptional = userService.findUserByEmail(forgotPasswordRequest.getEmail());

        if (userOptional.isPresent()) {
            UserEntity user = userOptional.get();
            String token = userService.createPasswordResetTokenForUser(user);
            
            String frontendBaseUrl = "http://localhost:8000";
            String resetUrl = frontendBaseUrl + "/auth/reset-password.html?token=" + token;
            
            emailService.sendPasswordResetEmail(user.getEmail(), resetUrl);
        }
        return ResponseEntity.ok("If your email address is in our system, you will receive a password reset link shortly.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        Optional<UserEntity> userOptional = userService.getUserByPasswordResetToken(resetPasswordRequest.getToken());

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Invalid or expired password reset token.");
        }

        UserEntity user = userOptional.get();
        userService.changeUserPassword(user, resetPasswordRequest.getNewPassword());
        
        return ResponseEntity.ok("Password has been reset successfully.");
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAccount(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal().toString())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: User not authenticated.");
        }

        String userEmail = authentication.getName();

        Optional<UserEntity> userOptional = userService.findUserByEmail(userEmail);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Authenticated user not found in database.");
        }

        UserEntity userToDelete = userOptional.get();
        
        try {
            userService.deleteUserByEmail(userToDelete.getEmail()); 
            
            SecurityContextHolder.clearContext(); 
            
            return ResponseEntity.ok("Account deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: Could not delete account. " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        String jwt = parseJwt(request);
        if (jwt != null) {
            tokenBlacklistService.blacklistToken(jwt);
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logout successful. Token has been added to blacklist.");
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal().toString())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: User not authenticated.");
        }

        String userEmail = authentication.getName();
        Optional<UserEntity> userOptional = userService.findUserByEmail(userEmail);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Authenticated user not found in database.");
        }

        UserEntity user = userOptional.get();

        if (!encoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Error: Incorrect current password.");
        }

        userService.changeUserPassword(user, changePasswordRequest.getNewPassword());

        return ResponseEntity.ok("Password changed successfully.");
    }
}