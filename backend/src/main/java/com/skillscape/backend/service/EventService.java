package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.Event;
import com.skillscape.backend.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class EventService {
    private final EventRepository eventRepo;

    public EventService(EventRepository eventRepo) {
        this.eventRepo = eventRepo;
    }

    public Event createEvent(Event e) {
        return eventRepo.save(e);
    }

    @Transactional(readOnly = true)
    public List<Event> listEvents() {
        return eventRepo.findAll();
    }

    @Transactional(readOnly = true)
    public Event getEvent(Long id) {
        return eventRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Event not found: " + id));
    }

    public Event updateEvent(Long id, Event updated) {
        Event existing = getEvent(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setOpenAt(updated.getOpenAt());
        existing.setCloseAt(updated.getCloseAt());
        return eventRepo.save(existing);
    }

    public void deleteEvent(Long id) {
        Event e = getEvent(id);
        eventRepo.delete(e);
    }
}