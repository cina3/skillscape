// src/main/java/com/skillscape/backend/service/BadgeService.java
package com.skillscape.backend.service;

import com.skillscape.backend.model.*;
import com.skillscape.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BadgeService {
    private final BadgeRepository      badgeRepo;
    private final UserBadgeRepository  userBadgeRepo;

    public void awardBadgesForUser(User user) {
        int xp = user.getXp();
        List<Badge> all = badgeRepo.findAllByOrderByXpThresholdAsc();
        for (Badge b : all) {
            if (xp >= b.getXpThreshold()
             && userBadgeRepo.findByUserAndBadge(user, b).isEmpty()) {
                UserBadge ub = UserBadge.builder()
                    .user(user)
                    .badge(b)
                    .build();
                userBadgeRepo.save(ub);
            }
        }
    }

    @Transactional(readOnly=true)
    public List<Badge> listAllBadges() {
        return badgeRepo.findAllByOrderByXpThresholdAsc();
    }

    @Transactional(readOnly=true)
    public List<UserBadge> listUserBadges(User user) {
        return userBadgeRepo.findByUser(user);
    }
}