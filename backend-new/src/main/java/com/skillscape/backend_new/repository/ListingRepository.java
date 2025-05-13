package com.skillscape.backend_new.repository;

import com.skillscape.backend_new.model.ListingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingRepository extends JpaRepository<ListingEntity, Long> {
}