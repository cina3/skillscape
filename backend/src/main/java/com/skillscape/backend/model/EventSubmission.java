// src/main/java/com/skillscape/backend/model/EventSubmission.java
package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_submissions",
       uniqueConstraints = @UniqueConstraint(
         columnNames = {"event_id","submitter_id"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EventSubmission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "submitter_id")
    private User submitter;

    @Column(nullable = false, length = 500)
    private String url;

    @CreationTimestamp
    private LocalDateTime submittedAt;
}