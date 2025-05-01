package com.skillscape.backend.controller;

import com.skillscape.backend.dto.PlaceApplicationRequest;
import com.skillscape.backend.dto.RespondApplicationRequest;
import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.JobApplication;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.JobApplicationService;
import com.skillscape.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@Validated
public class JobApplicationController {

    private final JobApplicationService appService;
    private final UserService userService;

    public JobApplicationController(JobApplicationService appService,
                                    UserService userService) {
        this.appService = appService;
        this.userService = userService;
    }

    @PostMapping("/jobs/{jobId}/applications")
    public ResponseEntity<JobApplication> placeApplication(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long jobId,
        @Valid @RequestBody PlaceApplicationRequest req
    ) {
        User applicant = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));

        JobApplication app = appService.placeApplication(
            jobId,
            req.getProposedBudget(),
            applicant
        );
        return new ResponseEntity<>(app, HttpStatus.CREATED);
    }

    @PutMapping("/applications/{appId}/respond")
    public JobApplication respondToApplication(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long appId,
        @Valid @RequestBody RespondApplicationRequest req
    ) {
        User customer = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));

        return appService.respondToApplication(
            appId,
            req.getAccept(),
            customer
        );
    }

    @GetMapping("/applications")
    public List<JobApplication> listMyApplications(
        @RequestHeader("X-User-Email") String email
    ) {
        User applicant = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        return appService.listByApplicant(applicant);
    }

    @GetMapping("/jobs/{jobId}/applications")
    public List<JobApplication> listByJob(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long jobId
    ) {
        User customer = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        return appService.listByJob(jobId, customer);
    }
}