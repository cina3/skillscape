package com.skillscape.backend_new.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BidResponse {
    private Long id;
    private Long bidderId;
    private String bidderDisplayName;
    private String description;
    private BigDecimal requestedPrice;
    private LocalDateTime createdAt;
}