// backend/src/main/java/com/skillscape/backend/controller/JobReviewController.java
package com.skillscape.backend.controller;

import com.skillscape.backend.dto.ReviewRequest;
import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.JobReview;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.JobReviewService;
import com.skillscape.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs/{jobId}/reviews")
public class JobReviewController {
    private final JobReviewService reviewService;
    private final UserService userService;

    public JobReviewController(JobReviewService reviewService,
                               UserService userService) {
        this.reviewService = reviewService;
        this.userService   = userService;
    }

    @GetMapping
    public List<JobReview> listReviews(@PathVariable Long jobId) {
        return reviewService.listReviews(jobId);
    }

    @PostMapping
    public ResponseEntity<JobReview> addReview(
            @RequestHeader("X-User-Email") String email,
            @PathVariable Long jobId,
            @Valid @RequestBody ReviewRequest req
    ) {
        User reviewer = userService.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));

        JobReview saved = reviewService.addReview(
                jobId,
                reviewer,
                req.getRating(),
                req.getComment()
        );
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}