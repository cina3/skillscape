// backend/src/main/java/com/skillscape/backend/model/JobReview.java
package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @Column(nullable = false)
    private int rating;

    @Column(length = 5000)
    private String comment;

    @CreationTimestamp
    private LocalDateTime createdAt;
}