package com.skillscape.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdjustRequest {
    @Min(-100000)      
    private int amount;

    @NotBlank
    private String reason;
}