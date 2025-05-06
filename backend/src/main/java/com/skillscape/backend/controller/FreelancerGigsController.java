package com.skillscape.backend.controller;

import com.skillscape.backend.model.GigAttachment;
import com.skillscape.backend.model.GigReview;
import com.skillscape.backend.service.GigAttachmentService;
import com.skillscape.backend.service.GigReviewService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/freelancers/me/gigs")
public class FreelancerGigsController {

    private final GigAttachmentService   gigAttachmentService;
    private final GigReviewService       gigReviewService;

    public FreelancerGigsController(GigAttachmentService gigAttachmentService,
                                    GigReviewService gigReviewService) {
        this.gigAttachmentService = gigAttachmentService;
        this.gigReviewService     = gigReviewService;
    }

    @GetMapping("/{gigId}/attachments")
    public List<GigAttachment> listGigAttachments(
        @AuthenticationPrincipal UserDetails ud,
        @PathVariable Long gigId
    ) {
        return gigAttachmentService.listForGig(gigId);
    }

    @GetMapping("/{gigId}/reviews")
    public List<GigReview> listGigReviews(
        @AuthenticationPrincipal UserDetails ud,
        @PathVariable Long gigId
    ) {
        return gigReviewService.listReviewsByGig(gigId);
    }
}