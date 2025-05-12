package com.skillscape.backend_new.repository;

import com.skillscape.backend_new.model.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    List<ReviewEntity> findByGigIdOrderByCreatedAtDesc(Long gigId);

    List<ReviewEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ReviewEntity> findByUserIdAndGigId(Long userId, Long gigId);

    @Query("SELECT AVG(r.score) FROM ReviewEntity r WHERE r.gig.id = :gigId")
    Double findAverageScoreByGigId(@Param("gigId") Long gigId);
}