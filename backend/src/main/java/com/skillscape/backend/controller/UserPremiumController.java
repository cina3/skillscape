package com.skillscape.backend.controller;

import com.skillscape.backend.model.User;
import com.skillscape.backend.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
public class UserPremiumController {

    private final UserService userService;

    public UserPremiumController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/upgrade")
    public User upgradeToPremium(@AuthenticationPrincipal UserDetails ud) {
        return userService.upgradeToPremium(ud.getUsername());
    }
}