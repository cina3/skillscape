package com.skillscape.backend.repository;

import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.GigReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<GigReview, Long> {
    List<GigReview> findByGig(Gig gig);

    @Query("SELECT COALESCE(AVG(r.rating),0) FROM Review r WHERE r.gig.id = :gigId")
    Double findAverageRatingByGigId(@Param("gigId") Long gigId);

    @Query("""
    SELECT COALESCE(AVG(r.rating),0)
      FROM Review r
     WHERE r.gig.creator.id = :userId
""")
Double findAverageRatingForGigsByUser(@Param("userId") Long userId);
}