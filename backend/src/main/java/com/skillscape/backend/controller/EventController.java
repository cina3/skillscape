package com.skillscape.backend.controller;

import com.skillscape.backend.dto.*;
import com.skillscape.backend.model.Event;
import com.skillscape.backend.model.EventSubmission;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.*;
import com.skillscape.backend.exception.NotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService           eventService;
    private final EventSubmissionService submissionService;
    private final UserService            userService;

    public EventController(EventService eventService,
                           EventSubmissionService submissionService,
                           UserService userService) {
        this.eventService     = eventService;
        this.submissionService= submissionService;
        this.userService      = userService;
    }

    @GetMapping
    public List<Event> listEvents() {
        return eventService.listEvents();
    }

    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id) {
        return eventService.getEvent(id);
    }

    @PostMapping("/{id}/submit")
    public EventSubmission submitToEvent(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails ud,
        @Valid @RequestBody SubmitEventRequest req
    ) {
        User user = userService.findByEmail(ud.getUsername())
            .orElseThrow(() -> new NotFoundException("User not found"));
        return submissionService.submit(id, user, req.getUrl());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Event> createEvent(
        @Valid @RequestBody CreateEventRequest req
    ) {
        Event e = Event.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .openAt(req.getOpenAt())
            .closeAt(req.getCloseAt())
            .build();
        return new ResponseEntity<>(eventService.createEvent(e), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Event updateEvent(
        @PathVariable Long id,
        @Valid @RequestBody UpdateEventRequest req
    ) {
        Event e = Event.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .openAt(req.getOpenAt())
            .closeAt(req.getCloseAt())
            .build();
        return eventService.updateEvent(id, e);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/submissions")
    public List<EventSubmission> listEventSubmissions(@PathVariable Long id) {
        return submissionService.listForEvent(id);
    }

    @GetMapping("/my-submissions")
    public List<EventSubmission> listMySubmissions(
        @AuthenticationPrincipal UserDetails ud
    ) {
        User user = userService.findByEmail(ud.getUsername())
            .orElseThrow(() -> new NotFoundException("User not found"));
        return submissionService.listByUser(user);
    }
}