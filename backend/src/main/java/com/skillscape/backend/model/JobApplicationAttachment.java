package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_application_attachments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class JobApplicationAttachment {
    @Id @GeneratedValue Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String url;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}