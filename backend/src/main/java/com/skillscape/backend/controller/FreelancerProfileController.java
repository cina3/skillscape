package com.skillscape.backend.controller;

import com.skillscape.backend.model.*;
import com.skillscape.backend.dto.PortfolioItemRequest;
import com.skillscape.backend.dto.ProfileUpdateRequest;
import com.skillscape.backend.service.FreelancerProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/freelancers/me/profile")
public class FreelancerProfileController {

    private final FreelancerProfileService service;

    public FreelancerProfileController(FreelancerProfileService service) {
        this.service = service;
    }

    @GetMapping
    public FreelancerProfile getProfile(
        @AuthenticationPrincipal UserDetails ud
    ) {
        return service.getOrCreateProfile(
            Long.parseLong(ud.getUsername()) 
        );
    }

    @GetMapping("/portfolio")
    public List<PortfolioItem> listPortfolio(
        @AuthenticationPrincipal UserDetails ud
    ) {
        return service.listPortfolio(Long.parseLong(ud.getUsername()));
    }

    @PostMapping("/portfolio")
    public PortfolioItem addPortfolio(
        @AuthenticationPrincipal UserDetails ud,
        @Valid @RequestBody PortfolioItemRequest req
    ) {
        return service.addPortfolioItem(
            Long.parseLong(ud.getUsername()),
            req.getTitle(), req.getDescription(), req.getUrl()
        );
    }

    @DeleteMapping("/portfolio/{id}")
    public ResponseEntity<?> removePortfolio(
        @AuthenticationPrincipal UserDetails ud,
        @PathVariable Long id
    ) {
        service.removePortfolioItem(Long.parseLong(ud.getUsername()), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping
    public FreelancerProfile updateProfile(
        @AuthenticationPrincipal UserDetails ud,
        @Valid @RequestBody ProfileUpdateRequest req   
    ) {
        return service.updateProfile(
            Long.parseLong(ud.getUsername()),
            req.getHeadline(),
            req.getDescription()
        );
    }
}