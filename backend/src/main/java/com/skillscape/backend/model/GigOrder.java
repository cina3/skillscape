package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "gig_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GigOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which gig is being ordered
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gig_id", nullable = false)
    private Gig gig;

    // Who placed the order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // You can override price per order, or just mirror gig.price
    @Column(nullable = false)
    private BigDecimal agreedPrice;

    // Lifecycle: PENDING → ACCEPTED/REJECTED → IN_PROGRESS → COMPLETED/CANCELLED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GigOrderStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}