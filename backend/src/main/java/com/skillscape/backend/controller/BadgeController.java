package com.skillscape.backend.controller;

import com.skillscape.backend.model.Badge;
import com.skillscape.backend.model.UserBadge;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.BadgeService;
import com.skillscape.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class BadgeController {
    private final BadgeService badgeService;
    private final UserService  userService;

    @GetMapping("/api/badges")
    public List<Badge> listBadges() {
        return badgeService.listAllBadges();
    }

    @GetMapping("/api/users/me/badges")
    public List<UserBadge> listMyBadges(
        @AuthenticationPrincipal UserDetails ud
    ) {
        User me = userService.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return badgeService.listUserBadges(me);
    }
}