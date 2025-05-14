package com.skillscape.backend_new.controller;

import com.skillscape.backend_new.dto.*;
import com.skillscape.backend_new.model.Status;
import com.skillscape.backend_new.service.ListingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingService service;

    public ListingController(ListingService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ListingResponse> createListing(
            @Valid @RequestBody CreateListingRequest dto,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(201)
                .body(service.createListing(dto, user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListing(@PathVariable Long id) {
        return ResponseEntity.ok(service.getListingById(id));
    }

    @GetMapping
    public ResponseEntity<List<ListingResponse>> allListings() {
        return ResponseEntity.ok(service.getListingsByStatus(Status.ACTIVE));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ListingResponse>> myListings(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
            service.getListingsByUserEmail(user.getUsername())
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody CreateListingRequest dto,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
            service.updateListing(id, dto, user.getUsername())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        service.deleteListing(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{listingId}/bids")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable Long listingId,
            @Valid @RequestBody BidRequest bid,
            @AuthenticationPrincipal UserDetails user) {
        bid.setListingId(listingId);
        return ResponseEntity.ok(
            service.placeBid(bid, user.getUsername())
        );
    }

    @PostMapping("/{listingId}/award")
    public ResponseEntity<OrderResponse> awardBid(
            @PathVariable Long listingId,
            @Valid @RequestBody AwardBidRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
            service.awardBid(listingId, req.getBidId(), user.getUsername())
        );
    }
}