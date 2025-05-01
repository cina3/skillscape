package com.skillscape.backend.repository;

import com.skillscape.backend.model.Job;
import com.skillscape.backend.model.JobApplication;
import com.skillscape.backend.model.User;
import com.skillscape.backend.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByJob(Job job);
    List<JobApplication> findByApplicant(User applicant);
    List<JobApplication> findByJobAndStatus(Job job, ApplicationStatus status);
    List<JobApplication> findByJobAndApplicantAndStatus(
        Job job,
        User applicant,
        ApplicationStatus status
    );
}