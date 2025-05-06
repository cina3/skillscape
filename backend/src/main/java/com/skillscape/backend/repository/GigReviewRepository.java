package com.skillscape.backend.repository;

import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.GigReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GigReviewRepository extends JpaRepository<GigReview, Long> {

    /* ─── Reviews for a single gig ─────────────────────────────── */
    List<GigReview> findByGig_Id(Long gigId);

    /* ─── Average rating for ONE gig ───────────────────────────── */
    @Query("""
           select coalesce(avg(r.rating), 0)
           from   GigReview r
           where  r.gig.id = :gigId
           """)
    Double avgRating(@Param("gigId") Long gigId);

    /* ─── Average rating across ALL gigs owned by a user ───────── */
    @Query("""
           select coalesce(avg(r.rating), 0)
           from   GigReview r
           where  r.gig.creator.id = :userId
           """)
    Double avgRatingForCreator(@Param("userId") Long userId);
    List<GigReview> findByGig(Gig gig);
}