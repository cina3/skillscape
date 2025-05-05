// src/main/java/com/skillscape/backend/controller/FreelancerSearchController.java
package com.skillscape.backend.controller;

import com.skillscape.backend.model.FreelancerProfile;
import com.skillscape.backend.service.FreelancerProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/freelancers")
public class FreelancerSearchController {

    private final FreelancerProfileService service;

    public FreelancerSearchController(FreelancerProfileService service) {
        this.service = service;
    }

    /** Search freelancers by name, headline, rating */
    @GetMapping
    public Page<FreelancerProfile> search(
        @RequestParam(value="name",       required=false) String name,
        @RequestParam(value="headline",   required=false) String headline,
        @RequestParam(value="ratingMin",  required=false) Double ratingMin,
        Pageable pageable
    ) {
        return service.searchProfiles(name, headline, ratingMin, pageable);
    }
}