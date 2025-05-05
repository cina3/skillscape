package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private FreelancerProfile profile;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 5000)
    private String description;

    @Column(nullable = false, length = 500)
    private String url;

    @CreationTimestamp
    private LocalDateTime createdAt;
}