package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Event {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 5000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime openAt;

    @Column(nullable = false)
    private LocalDateTime closeAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}