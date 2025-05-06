package com.skillscape.backend.repository;

import com.skillscape.backend.model.Event;
import com.skillscape.backend.model.EventSubmission;
import com.skillscape.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventSubmissionRepository
        extends JpaRepository<EventSubmission, Long> {

    List<EventSubmission> findByEvent(Event event);
    List<EventSubmission> findBySubmitter(User user);
}