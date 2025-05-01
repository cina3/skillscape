// backend/src/main/java/com/skillscape/backend/dto/GigDto.java
package com.skillscape.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class GigDto {
    private Long    id;
    private String  title;
    private String  description;
    private BigDecimal price;
    private boolean biddable;
    private boolean hourly;
    private String  categoryName;
    private String  creatorDisplayName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // the computed fields
    private double averageRating;
    private int    reviewCount;
    private int    orderCount;
}