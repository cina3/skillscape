package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "gig_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GigAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gig_id", nullable = false)
    private Gig gig;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String url;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}