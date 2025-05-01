package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String url;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}