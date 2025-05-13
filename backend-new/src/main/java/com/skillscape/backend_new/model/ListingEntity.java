package com.skillscape.backend_new.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "listing_what_you_get", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "bullet_point")
    @Size(max = 5)
    private List<String> whatYouGet = new ArrayList<>();

    @Column(name = "tools_and_technology", columnDefinition = "TEXT")
    private String toolsAndTechnology;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "is_price_fixed", nullable = false)
    private boolean isPriceFixed = true;

    @Column(name = "is_per_hour_pricing", nullable = false)
    private boolean isPerHourPricing = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "listing_file_urls", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "file_url")
    private List<String> fileUrls = new ArrayList<>();

    @Column(name = "delivery_time_days")
    private Integer deliveryTimeDays;

    @Column(name = "last_delivery_at")
    private LocalDateTime lastDeliveryAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "listing_languages", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "language")
    private List<String> languages = new ArrayList<>();

    @Column(name = "order_price")
    private BigDecimal orderPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "expected_delivery_date")
    private LocalDateTime expectedDeliveryDate;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "listing_upload_urls", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "upload_url")
    private List<String> uploadUrls = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;              

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "awarded_to_user_id")
    private UserEntity awardedToUser;     

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
         if (status == null) {
            status = Status.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "listing",
           cascade = CascadeType.ALL,
           orphanRemoval = true,
           fetch = FetchType.LAZY)
    private List<BidEntity> bids = new ArrayList<>();
}