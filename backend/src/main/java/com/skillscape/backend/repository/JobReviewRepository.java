// backend/src/main/java/com/skillscape/backend/repository/JobReviewRepository.java
package com.skillscape.backend.repository;

import com.skillscape.backend.model.Job;
import com.skillscape.backend.model.JobReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobReviewRepository extends JpaRepository<JobReview, Long> {
    List<JobReview> findByJob(Job job);

    @Query("SELECT COALESCE(AVG(r.rating),0) FROM JobReview r WHERE r.job.id = :jobId")
    Double findAverageRatingByJobId(@Param("jobId") Long jobId);

    @Query("""
    SELECT COALESCE(AVG(r.rating),0)
      FROM JobReview r
     WHERE r.job.creator.id = :userId
        """)
    Double findAverageRatingForJobsByUser(@Param("userId") Long userId);
}