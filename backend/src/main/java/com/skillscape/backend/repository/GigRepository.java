package com.skillscape.backend.repository;

import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface GigRepository extends JpaRepository<Gig, Long>, JpaSpecificationExecutor<Gig> {
    List<Gig> findByCreator(User creator);
}