package com.skillscape.backend.controller;

import com.skillscape.backend.dto.CreateJobRequest;
import com.skillscape.backend.dto.UpdateJobRequest;
import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.Job;
import com.skillscape.backend.model.JobStatus;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.CoverService;
import com.skillscape.backend.service.JobService;
import com.skillscape.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.net.URLConnection;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/jobs")
@Validated
public class JobController {

    private final JobService jobService;
    private final UserService userService;
    private final CoverService coverService;

    public JobController(JobService jobService,
                         UserService userService,
                         CoverService coverService) {
        this.jobService   = jobService;
        this.userService  = userService;
        this.coverService = coverService;
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
            req.getHourly(),
            req.getBiddable()
        );
        return new ResponseEntity<>(job, HttpStatus.CREATED);
    }

    @GetMapping
    public Page<Job> listJobs(
        @RequestParam(value="status", required=false) JobStatus status,
        Pageable pageable
    ) {
        if (status == null) {
            status = JobStatus.OPEN;
        }
        return jobService.searchJobs(
            /* q */           null,
            /* minBudget */   null,
            /* maxBudget */   null,
            /* status */      status,
            /* categoryId */  null,
            /* biddable */    null,
            /* minProps */    null,
            /* maxProps */    null,
            /* minRev */      null,
            /* maxRev */      null,
            /* minFrRating */ null,
            /* maxFrRating */ null,
            /* minJobRating */null,
            /* maxJobRating */null,
            pageable
        );
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
            req.getHourly(),
            principal,
            req.getBiddable()
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

    @PostMapping("/{id}/cover")
    public ResponseEntity<Void> uploadCover(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file
    ) throws Exception {
        User me = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));

        Job job = jobService.getJob(id);
        if (!job.getCreator().getId().equals(me.getId())) {
            throw new IllegalArgumentException("Not your job");
        }

        String stored = coverService.storeCover(file);
        job.setCoverUrl("/api/jobs/cover/" + stored);
        jobService.save(job);

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