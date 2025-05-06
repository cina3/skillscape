package com.skillscape.backend.controller;

import com.skillscape.backend.model.Notification;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.NotificationService;
import com.skillscape.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users/me/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notiService;
    private final UserService         userService;

    @GetMapping
    public List<Notification> list(
        @AuthenticationPrincipal UserDetails ud
    ) {
        User u = userService.findByEmail(ud.getUsername())
                    .orElseThrow();
        return notiService.listNotifications(u.getId());
    }

    @PutMapping("/{id}/read")
    public void markRead(
        @AuthenticationPrincipal UserDetails ud,
        @PathVariable Long id
    ) {
        User u = userService.findByEmail(ud.getUsername())
                    .orElseThrow();
        notiService.markAsRead(id, u.getId());
    }
}