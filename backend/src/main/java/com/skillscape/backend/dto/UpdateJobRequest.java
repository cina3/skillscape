package com.skillscape.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateJobRequest {
    @NotBlank @Size(max = 150)
    private String title;

    @Size(max = 5000)
    private String description;

    @NotNull @DecimalMin("0.0")
    private BigDecimal budget;

    @NotNull
    private Long categoryId;

    @NotNull
    private Boolean biddable;

    @NotNull
    private Boolean hourly;
}