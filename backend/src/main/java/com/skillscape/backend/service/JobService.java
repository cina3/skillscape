package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.*;
import com.skillscape.backend.repository.CategoryRepository;
import com.skillscape.backend.repository.JobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class JobService {
    private final JobRepository jobRepository;
    private final CategoryRepository categoryRepository;

    private static final Map<JobStatus, Set<JobStatus>> ALLOWED = Map.of(
        JobStatus.OPEN, Set.of(JobStatus.AWARDED, JobStatus.CANCELLED),
        JobStatus.AWARDED, Set.of(JobStatus.IN_PROGRESS, JobStatus.CANCELLED),
        JobStatus.IN_PROGRESS, Set.of(JobStatus.COMPLETED, JobStatus.CANCELLED),
        JobStatus.COMPLETED, Set.of(),
        JobStatus.CANCELLED, Set.of()
    );

    public JobService(JobRepository jobRepository,
                      CategoryRepository categoryRepository) {
        this.jobRepository = jobRepository;
        this.categoryRepository = categoryRepository;
    }

    private Category resolveCategory(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Category not found: " + id));
    }

    public Job createJob(String title,
                         String description,
                         BigDecimal budget,
                         User creator,
                         Long categoryId,
                         Boolean biddable) {
        Category cat = resolveCategory(categoryId);
        Job job = Job.builder()
                     .title(title)
                     .description(description)
                     .budget(budget)
                     .creator(creator)
                     .category(cat)
                     .biddable(biddable)
                     .status(JobStatus.OPEN)
                     .build();
        return jobRepository.save(job);
    }

    @Transactional(readOnly = true)
    public List<Job> listAllJobs() {
        return jobRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Job getJob(Long jobId) {
        return jobRepository.findById(jobId)
            .orElseThrow(() -> new NotFoundException("Job not found: " + jobId));
    }

    public Job updateJob(Long jobId,
                         String newTitle,
                         String newDescription,
                         BigDecimal newBudget,
                         Long categoryId,
                         Boolean biddable,
                         User principal) {
        Job job = getJob(jobId);
        if (!job.getCreator().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("Not your job to update");
        }
        job.setTitle(newTitle);
        job.setDescription(newDescription);
        job.setBudget(newBudget);
        job.setCategory(resolveCategory(categoryId));
        job.setBiddable(biddable);
        return jobRepository.save(job);
    }

    public void deleteJob(Long jobId, User principal) {
        Job job = getJob(jobId);
        if (!job.getCreator().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("Not your job to delete");
        }
        jobRepository.delete(job);
    }

    public Job changeStatus(Long jobId, JobStatus newStatus, User principal) {
        Job job = getJob(jobId);
        if (!job.getCreator().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("Not authorized to change status");
        }
        JobStatus current = job.getStatus();
        if (!ALLOWED.getOrDefault(current, Set.of()).contains(newStatus)) {
            throw new IllegalArgumentException(
                "Cannot transition job from " + current + " to " + newStatus
            );
        }
        job.setStatus(newStatus);
        return jobRepository.save(job);
    }
}