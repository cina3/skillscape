package com.skillscape.backend.controller;

import com.skillscape.backend.dto.ReviewRequest;
import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.GigReview;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.GigReviewService;
import com.skillscape.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/gigs/{gigId}/reviews")
public class GigReviewController {
    private final GigReviewService reviewService;
    private final UserService userService;

    public GigReviewController(GigReviewService reviewService,
                            UserService userService
    ) {
        this.reviewService = reviewService;
        this.userService   = userService;
    }

    @GetMapping
    public List<GigReview> listReviews(@PathVariable Long gigId) {
        return reviewService.listReviews(gigId);
    }

    @PostMapping
    public ResponseEntity<GigReview> addReview(
            @RequestHeader("X-User-Email") String email,
            @PathVariable Long gigId,
            @Valid @RequestBody ReviewRequest req
    ) {
        User reviewer = userService.findByEmail(email)
                                   .orElseThrow(() -> new NotFoundException("User not found: " + email));

        GigReview saved = reviewService.addReview(
            gigId,
            reviewer,
            req.getRating(),
            req.getComment()
        );
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}