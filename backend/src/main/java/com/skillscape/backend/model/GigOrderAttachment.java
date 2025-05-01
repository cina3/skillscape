package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "gig_order_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GigOrderAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private GigOrder gigOrder;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String url;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}