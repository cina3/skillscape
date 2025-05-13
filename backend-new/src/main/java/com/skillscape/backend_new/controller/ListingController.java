package com.skillscape.backend_new.controller;

import com.skillscape.backend_new.dto.CreateListingRequest;
import com.skillscape.backend_new.dto.ListingResponse;
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
    public ResponseEntity<ListingResponse> create(
            @Valid @RequestBody CreateListingRequest dto,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity
               .status(201)
               .body(service.createListing(dto, user.getUsername()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ListingResponse>> getMyListings(
            @AuthenticationPrincipal UserDetails user) {
        List<ListingResponse> listings = service.getListingsByUserEmail(user.getUsername());
        return ResponseEntity.ok(listings);
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ListingResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.getListingById(id));
    }

    @GetMapping
    public ResponseEntity<List<ListingResponse>> getAll() {
        return ResponseEntity.ok(service.getAllListings());
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<ListingResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateListingRequest dto,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(service.updateListing(id, dto, user.getUsername()));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        service.deleteListing(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}