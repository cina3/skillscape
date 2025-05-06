package com.skillscape.backend.repository;

import com.skillscape.backend.model.Badge;
import com.skillscape.backend.model.User;
import com.skillscape.backend.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBadgeRepository extends JpaRepository<UserBadge,Long> {
    List<UserBadge> findByUser(User user);
    Optional<UserBadge> findByUserAndBadge(User user, Badge badge);
}