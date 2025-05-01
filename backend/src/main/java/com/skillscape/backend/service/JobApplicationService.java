package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.*;
import com.skillscape.backend.repository.JobApplicationRepository;
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

    public JobApplicationService(JobApplicationRepository appRepo,
                                 JobRepository jobRepo) {
        this.appRepo = appRepo;
        this.jobRepo = jobRepo;
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
}