package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name="coin_transactions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CoinTransaction {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    private User user;

    @Column(nullable = false)
    private int amount;    

    @Column(length = 200, nullable = false)
    private String reason;   
    @CreationTimestamp
    private LocalDateTime createdAt;
}