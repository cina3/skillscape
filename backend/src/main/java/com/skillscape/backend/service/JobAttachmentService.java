package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.Job;
import com.skillscape.backend.model.JobAttachment;
import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.JobAttachmentRepository;
import com.skillscape.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class JobAttachmentService {

    private final JobAttachmentRepository attachRepo;
    private final JobRepository jobRepo;
    private final Path uploadRoot;

    public JobAttachmentService(
            JobAttachmentRepository attachRepo,
            JobRepository jobRepo,
            @Value("${attachments.upload-dir}") String uploadDir
    ) throws IOException {
        this.attachRepo = attachRepo;
        this.jobRepo    = jobRepo;
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadRoot);
    }

    public JobAttachment upload(Long jobId,
                                MultipartFile file,
                                User principal) throws IOException {
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found: " + jobId));

        if (!job.getCreator().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("Not your job");
        }

        String orig = file.getOriginalFilename();
        String ext = "";
        int idx = orig != null ? orig.lastIndexOf('.') : -1;
        if (idx > 0) ext = orig.substring(idx);
        String stored = UUID.randomUUID() + ext;

        Path target = uploadRoot.resolve(stored);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        JobAttachment att = JobAttachment.builder()
                .job(job)
                .filename(orig)
                .url("/api/job-attachments/" + stored)
                .build();
        return attachRepo.save(att);
    }

    @Transactional(readOnly = true)
    public List<JobAttachment> list(Long jobId) {
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found: " + jobId));
        return attachRepo.findByJob(job);
    }

    public Path loadAsPath(String storedName) {
        Path file = uploadRoot.resolve(storedName).normalize();
        if (!Files.exists(file)) {
            throw new NotFoundException("File not found: " + storedName);
        }
        return file;
    }
}