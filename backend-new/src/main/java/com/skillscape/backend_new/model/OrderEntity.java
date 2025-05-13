package com.skillscape.backend_new.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
  name = "orders",
  uniqueConstraints = @UniqueConstraint(columnNames = {"buyer_id","gig_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gig_id", nullable = true)
    private GigEntity gig;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private UserEntity buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private UserEntity seller;

    @Column(name = "order_price", nullable = false)
    private BigDecimal orderPrice;

    @Column(name = "is_price_fixed", nullable = false)
    private boolean isPriceFixed;

    @Column(name = "is_per_hour_pricing", nullable = false)
    private boolean isPerHourPricing;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Lob
    @Column(name = "requirements", columnDefinition = "TEXT", nullable = false)
    private String requirements;

    @Column(name = "expected_delivery_date")
    private LocalDateTime expectedDeliveryDate;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
      name = "order_upload_urls",
      joinColumns = @JoinColumn(name = "order_id")
    )
    @Column(name = "upload_url")
    private List<String> uploadUrls = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
      name = "order_deliver_urls",
      joinColumns = @JoinColumn(name = "order_id")
    )
    @Column(name = "deliver_url")
    private List<String> deliveredUrls;

    @Column(name = "order_percentage", nullable = false)
    private Integer percentage;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = Status.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}