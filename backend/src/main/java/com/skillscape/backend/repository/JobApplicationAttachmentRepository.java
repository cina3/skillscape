package com.skillscape.backend.repository;

import com.skillscape.backend.model.JobApplication;
import com.skillscape.backend.model.JobApplicationAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobApplicationAttachmentRepository
    extends JpaRepository<JobApplicationAttachment, Long> {

    List<JobApplicationAttachment> findByApplication(JobApplication app);
}