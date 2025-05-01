package com.skillscape.backend.repository;

import com.skillscape.backend.model.Job;
import com.skillscape.backend.model.JobAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobAttachmentRepository extends JpaRepository<JobAttachment, Long> {
    List<JobAttachment> findByJob(Job job);
}