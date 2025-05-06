package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.*;
import com.skillscape.backend.repository.NotificationRepository;
import com.skillscape.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
    private final NotificationRepository notiRepo;
    private final UserRepository         userRepo;

    public void notifyUser(Long userId,
                           String type,
                           String message,
                           String link,
                           boolean emailAlert) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        Notification n = Notification.builder()
            .user(user)
            .type(type)
            .message(message)
            .link(link)
            .build();
        notiRepo.save(n);
    }

    @Transactional(readOnly=true)
    public List<Notification> listNotifications(Long userId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        return notiRepo.findByUserOrderByCreatedAtDesc(user);
    }

    public void markAsRead(Long notificationId, Long userId) {
        Notification n = notiRepo.findById(notificationId)
            .orElseThrow(() -> new NotFoundException("Notification not found: " + notificationId));
        if (!n.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not yours");
        }
        n.setRead(true);
        notiRepo.save(n);
    }
}