package com.skillscape.backend.controller;

import com.skillscape.backend.dto.PlaceApplicationRequest;
import com.skillscape.backend.dto.RespondApplicationRequest;
import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.ApplicationStatus;
import com.skillscape.backend.model.JobApplication;
import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.JobApplicationRepository;
import com.skillscape.backend.repository.UserRepository;
import com.skillscape.backend.service.BadgeService;
import com.skillscape.backend.service.JobApplicationService;
import com.skillscape.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@Validated
public class JobApplicationController {

    private final JobApplicationService appService;
    private final JobApplicationRepository appRepo;
    private final UserService userService;
    private final UserRepository           userRepo;
    private final BadgeService             badgeService;

    public JobApplicationController(JobApplicationService appService,
                                    JobApplicationRepository appRepo,
                                    UserService userService,
                                    UserRepository userRepo,
                                    BadgeService badgeService) {
        this.appService = appService;
        this.appRepo = appRepo;
        this.userService = userService;
        this.userRepo = userRepo;
        this.badgeService = badgeService;
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

     public JobApplication completeApplication(Long applicationId, User principal) {
        JobApplication app = appRepo.findById(applicationId)
            .orElseThrow(() -> new NotFoundException("Application not found: " + applicationId));

        if (!(app.getApplicant().getId().equals(principal.getId())
           || app.getJob().getCreator().getId().equals(principal.getId()))) {
            throw new IllegalArgumentException("Not authorized to complete this application");
        }

        app.setStatus(ApplicationStatus.COMPLETED);
        appRepo.save(app);

        User freelancer = app.getApplicant();
        freelancer.setXp(freelancer.getXp() + 15);
        userRepo.save(freelancer);
        badgeService.awardBadgesForUser(freelancer);

        User customer = app.getJob().getCreator();
        customer.setXp(customer.getXp() + 8);
        userRepo.save(customer);
        badgeService.awardBadgesForUser(customer);

        return app;
    }

    @PostMapping("/{applicationId}/complete")
    public ResponseEntity<JobApplication> completeApplication(
        @PathVariable Long applicationId,
        @AuthenticationPrincipal UserDetails ud
    ) {
        User u = userService.findByEmail(ud.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        JobApplication completed = appService.completeApplication(applicationId, u);
        return ResponseEntity.ok(completed);
    }
}