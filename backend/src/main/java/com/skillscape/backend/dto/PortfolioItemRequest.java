package com.skillscape.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioItemRequest {
    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String url;
}