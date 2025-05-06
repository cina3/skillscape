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
    private final UserService userService;
    private final NotificationService notiService;

    public JobReviewService(JobReviewRepository reviewRepo,
                            JobRepository jobRepo,
                            JobApplicationRepository appRepo,
                            UserService userService,
                            NotificationService notiService) {
        this.reviewRepo = reviewRepo;
        this.jobRepo    = jobRepo;
        this.appRepo    = appRepo;
        this.userService = userService;
        this.notiService = notiService;
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

    @Transactional
    public JobReview createReview(Long jobId,
                                  String reviewerEmail,
                                  int rating,
                                  String comment) {
        User reviewer = userService.findByEmail(reviewerEmail)
            .orElseThrow(() -> new NotFoundException("User not found: " + reviewerEmail));
        Job job = jobRepo.findById(jobId)
            .orElseThrow(() -> new NotFoundException("Job not found: " + jobId));

        JobReview review = JobReview.builder()
            .job(job)
            .reviewer(reviewer)
            .rating(rating)
            .comment(comment)
            .build();
        review = reviewRepo.save(review);

        Long ownerId = job.getCreator().getId();
        notiService.notifyUser(
        ownerId,
        "NEW_REVIEW",
        reviewer.getDisplayName() +
            " left a review on your job #" + jobId,
        "/jobs/" + jobId + "/reviews",
        true
        );

        return review;
    }
}