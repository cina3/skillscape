package com.skillscape.backend.controller;

import com.skillscape.backend.dto.CreateGigRequest;
import com.skillscape.backend.dto.UpdateGigRequest;
import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.GigStatus;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.CoverService;
import com.skillscape.backend.service.GigService;
import com.skillscape.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.net.URLConnection;

@RestController
@RequestMapping("/api/gigs")
@Validated
public class GigController {
    private final GigService gigService;
    private final UserService userService;
    private final CoverService coverService;

    public GigController(GigService gigService,
                         UserService userService,
                         CoverService coverService
    ) {
        this.gigService = gigService;
        this.userService = userService;
        this.coverService = coverService;
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
                req.getBiddable(),
                req.getHourly()
        );
        return new ResponseEntity<>(gig, HttpStatus.CREATED);
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
            req.getBiddable(),
            req.getHourly()
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

    @PostMapping("/{id}/cover")
    public ResponseEntity<Void> uploadCover(
            @RequestHeader("X-User-Email") String email,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        User u = userService.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        Gig gig = gigService.getGig(id);
        if (!gig.getCreator().getId().equals(u.getId())) 
            throw new IllegalArgumentException("Not your gig");
        String stored = coverService.storeCover(file);
        gig.setCoverUrl("/api/gigs/cover/"+stored);
        gigService.save(gig);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/cover/{filename:.+}")
    public ResponseEntity<Resource> serveCover(
            @PathVariable String filename,
            HttpServletRequest request
    ) throws Exception {
        Resource resource = coverService.load(filename);
        
        String contentType = request.getServletContext()
                                    .getMimeType(resource.getFile().getAbsolutePath());
        
        if (contentType == null) {
            contentType = URLConnection.guessContentTypeFromName(resource.getFilename());
        }
        
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}