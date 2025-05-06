package com.skillscape.backend.controller;

import com.skillscape.backend.model.User;
import com.skillscape.backend.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/{userId}/premium")
    public User setPremiumFlag(
        @PathVariable Long userId,
        @RequestParam boolean value
    ) {
        return userService.setPremium(userId, value);
    }
}