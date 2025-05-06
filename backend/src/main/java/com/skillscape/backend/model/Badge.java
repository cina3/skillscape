package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="badges")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Badge {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true, length=100)
    private String name;

    @Column(length=500)
    private String description;

    @Column(nullable=false)
    private int xpThreshold;          
}