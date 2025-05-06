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
public class GigReviewService {
    private final ReviewRepository reviewRepo;
    private final GigRepository gigRepo;
    private final GigOrderRepository orderRepo;
    private final UserService userService;
    private final NotificationService notiService;

    public GigReviewService(ReviewRepository reviewRepo,
                            GigRepository gigRepo,
                            GigOrderRepository orderRepo,
                            UserService userService,
                            NotificationService notiService
    ) {
        this.reviewRepo = reviewRepo;
        this.gigRepo    = gigRepo;
        this.orderRepo  = orderRepo;
        this.userService = userService;
        this.notiService = notiService;
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

    @Transactional(readOnly = true)
    public List<GigReview> listReviewsByGig(Long gigId) {
        Gig gig = gigRepo.findById(gigId)
            .orElseThrow(() -> new NotFoundException("Gig not found: " + gigId));
        return reviewRepo.findByGig(gig);
    }

    @Transactional
    public GigReview createReview(Long gigId,
                              String reviewerEmail,
                              int rating,
                              String comment) {
    User reviewer = userService.findByEmail(reviewerEmail)
        .orElseThrow(() -> new NotFoundException("User not found: " + reviewerEmail));
    Gig gig = gigRepo.findById(gigId)
        .orElseThrow(() -> new NotFoundException("Gig not found: " + gigId));

    GigReview review = GigReview.builder()
        .gig(gig)
        .reviewer(reviewer)
        .rating(rating)
        .comment(comment)
        .build();
    review = reviewRepo.save(review);

    Long ownerId = gig.getCreator().getId();
    notiService.notifyUser(
      ownerId,
      "NEW_REVIEW",
      reviewer.getDisplayName() +
        " left a review on your gig #" + gigId,
      "/gigs/" + gigId + "/reviews",
      true
    );

    return review;
}
}