package com.skillscape.backend_new.controller;

import com.skillscape.backend_new.dto.GigCreateRequest;
import com.skillscape.backend_new.dto.GigResponse;
import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.service.GigService;
import com.skillscape.backend_new.service.UserService; 
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gigs")
public class GigController {

    private final GigService gigService;
    private final UserService userService; 

    @Autowired
    public GigController(GigService gigService, UserService userService) {
        this.gigService = gigService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<GigResponse> createGig(@Valid @RequestBody GigCreateRequest gigCreateRequestDTO,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity currentUser = userService.getUserByEmail(userDetails.getUsername());
        GigResponse createdGig = gigService.createGig(gigCreateRequestDTO, currentUser);
        return new ResponseEntity<>(createdGig, HttpStatus.CREATED);
    }

    @GetMapping("/{gigId}")
    public ResponseEntity<GigResponse> getGigById(@PathVariable Long gigId) {
        GigResponse gig = gigService.getGigById(gigId);
        if (gig != null) {
            return ResponseEntity.ok(gig);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<GigResponse>> getAllGigs() {
        List<GigResponse> gigs = gigService.getAllGigs();
        return ResponseEntity.ok(gigs);
    }

    @GetMapping("/my-gigs")
    public ResponseEntity<List<GigResponse>> getMyGigs(@AuthenticationPrincipal UserDetails userDetails) {
        UserEntity currentUser = userService.getUserByEmail(userDetails.getUsername());
        List<GigResponse> myGigs = gigService.getGigsByOwner(currentUser);
        return ResponseEntity.ok(myGigs);
    }
}