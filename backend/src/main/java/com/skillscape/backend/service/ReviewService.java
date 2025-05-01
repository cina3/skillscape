package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.*;
import com.skillscape.backend.repository.GigOrderRepository;
import com.skillscape.backend.repository.GigRepository;
import com.skillscape.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReviewService {
    private final ReviewRepository reviewRepo;
    private final GigRepository gigRepo;
    private final GigOrderRepository orderRepo;

    public ReviewService(ReviewRepository reviewRepo,
                         GigRepository gigRepo,
                         GigOrderRepository orderRepo
    ) {
        this.reviewRepo = reviewRepo;
        this.gigRepo    = gigRepo;
        this.orderRepo  = orderRepo;
    }

    @Transactional(readOnly = true)
    public List<GigReview> listReviews(Long gigId) {
        Gig gig = gigRepo.findById(gigId)
                         .orElseThrow(() -> new NotFoundException("Gig not found: " + gigId));
        return reviewRepo.findByGig(gig);
    }

    public GigReview addReview(Long gigId,
                            User reviewer,
                            int rating,
                            String comment
    ) {
        Gig gig = gigRepo.findById(gigId)
                         .orElseThrow(() -> new NotFoundException("Gig not found: " + gigId));

        boolean hasCompleted = orderRepo
            .findByGigAndCustomerAndStatus(gig, reviewer, GigOrderStatus.COMPLETED)
            .stream().findAny().isPresent();

        if (!hasCompleted) {
            throw new IllegalArgumentException(
                "Cannot review a gig you have not completed an order for"
            );
        }

        GigReview review = GigReview.builder()
            .gig(gig)
            .reviewer(reviewer)
            .rating(rating)
            .comment(comment)
            .build();
        return reviewRepo.save(review);
    }
}