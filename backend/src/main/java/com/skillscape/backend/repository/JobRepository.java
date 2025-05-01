package com.skillscape.backend.repository;

import com.skillscape.backend.model.Job;
import com.skillscape.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long>,
                                        JpaSpecificationExecutor<Job> {
    List<Job> findByCreator(User creator);
}