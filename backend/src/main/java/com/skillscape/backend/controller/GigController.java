package com.skillscape.backend.controller;

import com.skillscape.backend.dto.CreateGigRequest;
import com.skillscape.backend.dto.UpdateGigRequest;
import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.GigStatus;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.GigService;
import com.skillscape.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/gigs")
@Validated
public class GigController {
    private final GigService gigService;
    private final UserService userService;

    public GigController(GigService gigService,
                         UserService userService
    ) {
        this.gigService = gigService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Gig> createGig(
            @RequestHeader("X-User-Email") String email,
            @Valid @RequestBody CreateGigRequest req
    ) {
        User creator = userService.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));

        Gig gig = gigService.createGig(
                req.getTitle(),
                req.getDescription(),
                creator,
                req.getPrice(),
                req.getCategoryId(),
                req.getBiddable()
        );
        return new ResponseEntity<>(gig, HttpStatus.CREATED);
    }

    
    @GetMapping
    public List<Gig> listGigs(
        @RequestParam(value = "q",                   required = false) String      q,
        @RequestParam(value = "category",            required = false) Long        categoryId,
        @RequestParam(value = "minPrice",            required = false) BigDecimal  minPrice,
        @RequestParam(value = "maxPrice",            required = false) BigDecimal  maxPrice,
        @RequestParam(value = "status",              required = false) GigStatus   status,
        @RequestParam(value = "minOrders",           required = false) Integer     minOrders,
        @RequestParam(value = "maxOrders",           required = false) Integer     maxOrders,
        @RequestParam(value = "minReviews",          required = false) Integer     minReviews,
        @RequestParam(value = "maxReviews",          required = false) Integer     maxReviews,
        @RequestParam(value = "minFreelancerRating", required = false) Double      minFreelancerRating,
        @RequestParam(value = "maxFreelancerRating", required = false) Double      maxFreelancerRating,
        @RequestParam(value = "minGigRating",        required = false) Double      minGigRating,   
        @RequestParam(value = "maxGigRating",        required = false) Double      maxGigRating,
        @RequestParam(value= "biddable",             required=false)   Boolean     biddable
    ) {
        return gigService.listGigs(
        q, minPrice, maxPrice, status, categoryId,
        minOrders, maxOrders, minReviews, maxReviews,
        minFreelancerRating, maxFreelancerRating,
        minGigRating, maxGigRating, biddable    
        );
    }

    @GetMapping("/{id}")
    public Gig getGig(@PathVariable Long id) {
        return gigService.getGig(id);
    }

    @PutMapping("/{id}")
    public Gig updateGig(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long id,
        @Valid @RequestBody UpdateGigRequest req
    ) {
        User principal = userService.findByEmail(email)
                                    .orElseThrow(() -> new NotFoundException("User not found: " + email));
        return gigService.updateGig(
            id,
            req.getTitle(),
            req.getDescription(),
            req.getPrice(),
            req.getCategoryId(),
            principal,
            req.getBiddable()
        );
    }

    @PutMapping("/{id}/status")
    public Gig changeStatus(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long id,
        @RequestParam GigStatus status
    ) {
        User principal = userService.findByEmail(email)
                                    .orElseThrow(() -> new NotFoundException("User not found: " + email));

        return gigService.changeStatus(id, status, principal);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGig(
            @RequestHeader("X-User-Email") String email,
            @PathVariable Long id
    ) {
        User principal = userService.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));

        gigService.deleteGig(id, principal);
    }

    @GetMapping
    public Page<Gig> listGigs(
        @RequestParam(value = "q",                   required = false) String      q,
        @RequestParam(value = "category",            required = false) Long        categoryId,
        @RequestParam(value = "minPrice",            required = false) BigDecimal  minPrice,
        @RequestParam(value = "maxPrice",            required = false) BigDecimal  maxPrice,
        @RequestParam(value = "status",              required = false) GigStatus   status,
        @RequestParam(value = "minOrders",           required = false) Integer     minOrders,
        @RequestParam(value = "maxOrders",           required = false) Integer     maxOrders,
        @RequestParam(value = "minReviews",          required = false) Integer     minReviews,
        @RequestParam(value = "maxReviews",          required = false) Integer     maxReviews,
        @RequestParam(value = "minFreelancerRating", required = false) Double      minFreelancerRating,
        @RequestParam(value = "maxFreelancerRating", required = false) Double      maxFreelancerRating,
        @RequestParam(value = "minGigRating",        required = false) Double      minGigRating,
        @RequestParam(value = "maxGigRating",        required = false) Double      maxGigRating,
        @RequestParam(value = "biddable",            required = false) Boolean     biddable,
        Pageable pageable
    ) {
        return gigService.searchGigs(
            q, minPrice, maxPrice, status, categoryId,
            minOrders, maxOrders, minReviews, maxReviews,
            minFreelancerRating, maxFreelancerRating,
            minGigRating, maxGigRating, biddable,
            pageable
        );
    }
}