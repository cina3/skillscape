package com.skillscape.backend.repository;

import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GigRepository extends JpaRepository<Gig, Long> {
    List<Gig> findByCreator(User creator);
}