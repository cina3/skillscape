package com.skillscape.backend_new.repository;

import com.skillscape.backend_new.model.ListingEntity;
import com.skillscape.backend_new.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListingRepository extends JpaRepository<ListingEntity, Long> {
    List<ListingEntity> findByUser(UserEntity user);
}