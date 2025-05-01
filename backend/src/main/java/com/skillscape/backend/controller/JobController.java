package com.skillscape.backend.controller;

import com.skillscape.backend.dto.CreateJobRequest;
import com.skillscape.backend.dto.UpdateJobRequest;
import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.Job;
import com.skillscape.backend.model.JobStatus;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.JobService;
import com.skillscape.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@Validated
public class JobController {
    private final JobService jobService;
    private final UserService userService;
    public JobController(JobService jobService,
                         UserService userService) {
        this.jobService = jobService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Job> createJob(
        @RequestHeader("X-User-Email") String email,
        @Valid @RequestBody CreateJobRequest req
    ) {
        User creator = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        Job job = jobService.createJob(
            req.getTitle(),
            req.getDescription(),
            req.getBudget(),
            creator,
            req.getCategoryId(),
            req.getBiddable()
        );
        return new ResponseEntity<>(job, HttpStatus.CREATED);
    }

    @GetMapping
    public List<Job> listJobs() {
        return jobService.listAllJobs();
    }

    @GetMapping("/{id}")
    public Job getJob(@PathVariable Long id) {
        return jobService.getJob(id);
    }

    @PutMapping("/{id}")
    public Job updateJob(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long id,
        @Valid @RequestBody UpdateJobRequest req
    ) {
        User principal = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        return jobService.updateJob(
            id,
            req.getTitle(),
            req.getDescription(),
            req.getBudget(),
            req.getCategoryId(),
            req.getBiddable(),
            principal
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteJob(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long id
    ) {
        User principal = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        jobService.deleteJob(id, principal);
    }

    @PutMapping("/{id}/status")
    public Job changeStatus(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long id,
        @RequestParam JobStatus status
    ) {
        User principal = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        return jobService.changeStatus(id, status, principal);
    }
}