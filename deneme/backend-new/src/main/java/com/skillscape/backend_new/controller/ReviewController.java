package com.skillscape.backend_new.controller;

import com.skillscape.backend_new.dto.ReviewRequest;
import com.skillscape.backend_new.model.ReviewEntity;
import com.skillscape.backend_new.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewRequest> createReview(@Valid @RequestBody ReviewRequest dto) {
        ReviewEntity saved = reviewService.leaveReview(
            dto.getUserId(),
            dto.getGigId(),
            dto.getScore(),
            dto.getComment()
        );
        return ResponseEntity.ok(toDto(saved));
    }

    @GetMapping("/gig/{gigId}")
    public ResponseEntity<List<ReviewRequest>> getByGig(@PathVariable Long gigId) {
        List<ReviewRequest> list = reviewService.getReviewsForGig(gigId)
            .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewRequest>> getByUser(@PathVariable Long userId) {
        List<ReviewRequest> list = reviewService.getReviewsByUser(userId)
            .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewRequest> updateReview(
        @PathVariable Long reviewId,
        @Valid @RequestBody ReviewRequest dto
    ) {
        ReviewEntity updated = reviewService.updateReview(
            reviewId,
            dto.getScore(),
            dto.getComment()
        );
        return ResponseEntity.ok(toDto(updated));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    private ReviewRequest toDto(ReviewEntity r) {
        ReviewRequest dto = new ReviewRequest();
        dto.setId(r.getId());
        dto.setScore(r.getScore());
        dto.setComment(r.getComment());
        dto.setUserId(r.getUser().getId());
        dto.setGigId(r.getGig().getId());
        dto.setCreatedAt(r.getCreatedAt().format(fmt));
        return dto;
    }
}