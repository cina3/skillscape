package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.Job;
import com.skillscape.backend.model.JobAttachment;
import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.JobAttachmentRepository;
import com.skillscape.backend.repository.JobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
public class JobAttachmentService {

    private final JobAttachmentRepository attachRepo;
    private final JobRepository jobRepo;
    private final CoverService coverService;

    public JobAttachmentService(JobAttachmentRepository attachRepo,
                                JobRepository jobRepo,
                                CoverService coverService) {
        this.attachRepo   = attachRepo;
        this.jobRepo      = jobRepo;
        this.coverService = coverService;
    }

    /**
     * Upload a file to showcase a Job.
     * Only the Job’s creator may do this.
     */
    public JobAttachment upload(Long jobId,
                                MultipartFile file,
                                User principal) throws Exception {
        Job job = jobRepo.findById(jobId)
            .orElseThrow(() -> new NotFoundException("Job not found: " + jobId));

        if (!job.getCreator().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("Not your job");
        }

        // store the file and build a download URL
        String stored = coverService.storeCover(file);
        String url    = "/api/job-attachments/" + stored;

        JobAttachment att = JobAttachment.builder()
            .job(job)
            .filename(file.getOriginalFilename())
            .url(url)
            .build();

        return attachRepo.save(att);
    }

    @Transactional(readOnly = true)
    public List<JobAttachment> list(Long jobId) {
        Job job = jobRepo.findById(jobId)
            .orElseThrow(() -> new NotFoundException("Job not found: " + jobId));
        return attachRepo.findByJob(job);
    }
}