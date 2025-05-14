package com.skillscape.backend_new.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateOrderRequest {
    @NotNull
    private Long gigId;

    @NotNull
    private String requirements;

    private BigDecimal requestedPrice;

    private LocalDateTime expectedDeliveryDate;

    private List<String> uploadUrls;
}