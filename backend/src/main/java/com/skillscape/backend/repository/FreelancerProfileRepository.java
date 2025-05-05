package com.skillscape.backend.repository;

import com.skillscape.backend.model.FreelancerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FreelancerProfileRepository
    extends JpaRepository<FreelancerProfile, Long> {
  Optional<FreelancerProfile> findByUserId(Long userId);
}