// backend/src/main/java/com/skillscape/backend/service/JobReviewService.java
package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.*;
import com.skillscape.backend.repository.JobApplicationRepository;
import com.skillscape.backend.repository.JobRepository;
import com.skillscape.backend.repository.JobReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class JobReviewService {
    private final JobReviewRepository reviewRepo;
    private final JobRepository jobRepo;
    private final JobApplicationRepository appRepo;

    public JobReviewService(JobReviewRepository reviewRepo,
                            JobRepository jobRepo,
                            JobApplicationRepository appRepo) {
        this.reviewRepo = reviewRepo;
        this.jobRepo    = jobRepo;
        this.appRepo    = appRepo;
    }

    @Transactional(readOnly = true)
    public List<JobReview> listReviews(Long jobId) {
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found: " + jobId));
        return reviewRepo.findByJob(job);
    }

    public JobReview addReview(Long jobId,
                               User reviewer,
                               int rating,
                               String comment) {
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found: " + jobId));

        boolean hasCompleted = appRepo
            .findByJobAndApplicantAndStatus(job, reviewer, ApplicationStatus.COMPLETED)
            .stream().findAny().isPresent();

        if (!hasCompleted) {
            throw new IllegalArgumentException(
                "Cannot review a job you have not completed an application for"
            );
        }

        JobReview review = JobReview.builder()
                .job(job)
                .reviewer(reviewer)
                .rating(rating)
                .comment(comment)
                .build();
        return reviewRepo.save(review);
    }
}