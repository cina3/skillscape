// src/main/java/com/skillscape/backend_new/dto/OrderResponseDto.java
package com.skillscape.backend_new.dto;

import com.skillscape.backend_new.model.Status;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private Long gigId;
    private Long buyerId;
    private Long sellerId;

    private BigDecimal orderPrice;

    private boolean isPriceFixed;
    private boolean isPerHourPricing;

    private Status status;
    private String requirements;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime deliveredAt;
    private List<String> uploadUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}