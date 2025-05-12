package com.skillscape.backend_new.service;

import com.skillscape.backend_new.model.GigEntity;
import com.skillscape.backend_new.model.ReviewEntity;
import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.repository.GigRepository;
import com.skillscape.backend_new.repository.ReviewRepository;
import com.skillscape.backend_new.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final UserRepository userRepo;
    private final GigRepository gigRepo;

    public ReviewService(ReviewRepository reviewRepo,
                         UserRepository userRepo,
                         GigRepository gigRepo) {
        this.reviewRepo = reviewRepo;
        this.userRepo   = userRepo;
        this.gigRepo    = gigRepo;
    }

    @Transactional
    public ReviewEntity leaveReview(Long userId, Long gigId, int score, String comment) {
        UserEntity user = userRepo.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        GigEntity gig = gigRepo.findById(gigId)
            .orElseThrow(() -> new EntityNotFoundException("Gig not found"));

        Optional<ReviewEntity> existing = reviewRepo.findByUserIdAndGigId(userId, gigId);
        if (existing.isPresent()) {
            ReviewEntity rev = existing.get();
            rev.setScore(score);
            rev.setComment(comment);
            return reviewRepo.save(rev);
        } else {
            ReviewEntity rev = new ReviewEntity();
            rev.setUser(user);
            rev.setGig(gig);
            rev.setScore(score);
            rev.setComment(comment);
            return reviewRepo.save(rev);
        }
    }

    @Transactional(readOnly = true)
    public List<ReviewEntity> getReviewsForGig(Long gigId) {
        gigRepo.findById(gigId)
               .orElseThrow(() -> new EntityNotFoundException("Gig not found"));
        return reviewRepo.findByGigIdOrderByCreatedAtDesc(gigId);
    }

    @Transactional(readOnly = true)
    public List<ReviewEntity> getReviewsByUser(Long userId) {
        userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return reviewRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public ReviewEntity updateReview(Long reviewId, int score, String comment) {
        ReviewEntity rev = reviewRepo.findById(reviewId)
            .orElseThrow(() -> new EntityNotFoundException("Review not found"));

        rev.setScore(score);
        rev.setComment(comment);
        return reviewRepo.save(rev);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        if (!reviewRepo.existsById(reviewId)) {
            throw new EntityNotFoundException("Review not found");
        }
        reviewRepo.deleteById(reviewId);
    }
}