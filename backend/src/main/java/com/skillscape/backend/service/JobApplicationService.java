package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.*;
import com.skillscape.backend.repository.JobApplicationRepository;
import com.skillscape.backend.repository.UserRepository;
import com.skillscape.backend.repository.JobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class JobApplicationService {
    private final JobApplicationRepository appRepo;
    private final JobRepository jobRepo;
    private final UserRepository userRepo;
    private final BadgeService badgeService;
    private final NotificationService notiService;

    public JobApplicationService(JobApplicationRepository appRepo,
                                 JobRepository jobRepo,
                                 UserRepository userRepo,
                                 BadgeService badgeService,
                                 NotificationService notiService) {
        this.appRepo = appRepo;
        this.jobRepo = jobRepo;
        this.userRepo = userRepo;
        this.badgeService = badgeService;
        this.notiService = notiService;
    }

    public JobApplication placeApplication(Long jobId,
                                           BigDecimal offeredBudget,
                                           User applicant
    ) {
        Job job = jobRepo.findById(jobId)
            .orElseThrow(() -> new NotFoundException("Job not found: " + jobId));
        if (job.getCreator().getId().equals(applicant.getId())) {
            throw new IllegalArgumentException("Cannot apply to your own job");
        }

        BigDecimal budget = job.isBiddable()
            ? (offeredBudget != null ? offeredBudget : job.getBudget())
            : job.getBudget();

        ApplicationStatus initial = job.isBiddable()
            ? ApplicationStatus.PENDING
            : ApplicationStatus.ACCEPTED;

        JobApplication app = JobApplication.builder()
            .job(job)
            .applicant(applicant)
            .proposedBudget(budget)
            .status(initial)
            .build();

        if (!job.isBiddable()) {
            job.setStatus(JobStatus.AWARDED);
            jobRepo.save(job);
        }

        return appRepo.save(app);
    }

    public JobApplication respondToApplication(Long applicationId,
                                               boolean accept,
                                               User principal) {
        JobApplication app = appRepo.findById(applicationId)
            .orElseThrow(() -> new NotFoundException("Application not found: " + applicationId));

        if (!app.getJob().getCreator().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("Not authorized to respond");
        }

        app.setStatus(accept
            ? ApplicationStatus.ACCEPTED
            : ApplicationStatus.REJECTED);

        String statusText = accept ? "accepted" : "rejected";
        Long applicantId = app.getApplicant().getId();
        Long creatorId   = app.getJob().getCreator().getId();

        notiService.notifyUser(
        applicantId,
        "APPLICATION_" + (accept ? "ACCEPTED" : "REJECTED"),
        "Your application #" + applicationId + " was " + statusText,
        "/applications/" + applicationId,
        true
        );

        notiService.notifyUser(
        creatorId,
        "APPLICATION_RESPONSE",
        "You have " + (accept ? "accepted" : "rejected") +
            " application #" + applicationId,
        "/applications/" + applicationId,
        false
        );

        return appRepo.save(app);
    }

    @Transactional(readOnly = true)
    public List<JobApplication> listByApplicant(User applicant) {
        return appRepo.findByApplicant(applicant);
    }

    @Transactional(readOnly = true)
    public List<JobApplication> listByJob(Long jobId, User principal) {
        Job job = jobRepo.findById(jobId)
            .orElseThrow(() -> new NotFoundException("Job not found: " + jobId));

        if (!job.getCreator().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("Not authorized to view proposals");
        }
        return appRepo.findByJob(job);
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
}