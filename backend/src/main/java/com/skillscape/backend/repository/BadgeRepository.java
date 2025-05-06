package com.skillscape.backend.repository;

import com.skillscape.backend.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge,Long> {
    List<Badge> findAllByOrderByXpThresholdAsc();
}