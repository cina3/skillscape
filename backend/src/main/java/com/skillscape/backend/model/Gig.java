package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "gigs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 5000)
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Builder.Default
    @OneToMany(mappedBy = "gig", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GigOrder> orders = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "gig", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GigReview> reviews = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GigStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean biddable = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean hourly = false;

    @Formula("(select coalesce(avg(r.rating),0) from gig_reviews r where r.gig_id = id)")
    private double averageRating;

    @Formula("(select count(*) from gig_reviews r where r.gig_id = id)")
    private int reviewCount;

    @Formula("(select count(*) from gig_orders o where o.gig_id = id)")
    private int orderCount;

    @Column(length = 500)
    private String coverUrl;
}