package com.skillscape.backend.repository;

import com.skillscape.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> { }