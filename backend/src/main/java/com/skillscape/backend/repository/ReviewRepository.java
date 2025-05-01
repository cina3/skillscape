package com.skillscape.backend.repository;

import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByGig(Gig gig);
}