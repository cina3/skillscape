package com.skillscape.backend_new.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BidRequest {
    @NotNull
    private Long listingId;

    @NotBlank
    private String description;

    @NotNull @DecimalMin("1.00")
    private BigDecimal requestedPrice;
}