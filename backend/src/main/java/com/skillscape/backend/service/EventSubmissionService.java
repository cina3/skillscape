// src/main/java/com/skillscape/backend/service/EventSubmissionService.java
package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.Event;
import com.skillscape.backend.model.EventSubmission;
import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.EventRepository;
import com.skillscape.backend.repository.EventSubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class EventSubmissionService {
    private final EventSubmissionRepository subRepo;
    private final EventRepository           eventRepo;

    public EventSubmissionService(EventSubmissionRepository subRepo,
                                  EventRepository eventRepo) {
        this.subRepo   = subRepo;
        this.eventRepo = eventRepo;
    }

    public EventSubmission submit(Long eventId, User user, String url) {
        Event event = eventRepo.findById(eventId)
            .orElseThrow(() -> new NotFoundException("Event not found: " + eventId));

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(event.getOpenAt()) || now.isAfter(event.getCloseAt())) {
            throw new IllegalStateException("Event not open for submissions");
        }

        EventSubmission sub = EventSubmission.builder()
            .event(event)
            .submitter(user)
            .url(url)
            .build();
        return subRepo.save(sub);
    }

    @Transactional(readOnly = true)
    public List<EventSubmission> listForEvent(Long eventId) {
        Event event = eventRepo.findById(eventId)
            .orElseThrow(() -> new NotFoundException("Event not found: " + eventId));
        return subRepo.findByEvent(event);
    }

    @Transactional(readOnly = true)
    public List<EventSubmission> listByUser(User user) {
        return subRepo.findBySubmitter(user);
    }
}