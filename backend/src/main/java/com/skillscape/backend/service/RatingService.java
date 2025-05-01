package com.skillscape.backend.service;

import com.skillscape.backend.repository.ReviewRepository;
import com.skillscape.backend.repository.JobReviewRepository;
import org.springframework.stereotype.Service;

@Service
public class RatingService {
    private final ReviewRepository reviewRepo;
    private final JobReviewRepository jobReviewRepo;

    public RatingService(ReviewRepository reviewRepo,
                         JobReviewRepository jobReviewRepo) {
        this.reviewRepo   = reviewRepo;
        this.jobReviewRepo = jobReviewRepo;
    }

    public double getAverageGigRating(Long gigId) {
        return reviewRepo.findAverageRatingByGigId(gigId);
    }

    public double getAverageJobRating(Long jobId) {
        return jobReviewRepo.findAverageRatingByJobId(jobId);
    }

    public double getAverageFreelancerRating(Long userId) {
        double gigAvg = reviewRepo.findAverageRatingForGigsByUser(userId);
        double jobAvg = jobReviewRepo.findAverageRatingForJobsByUser(userId);
        return (gigAvg + jobAvg) / 2.0;
    }
}