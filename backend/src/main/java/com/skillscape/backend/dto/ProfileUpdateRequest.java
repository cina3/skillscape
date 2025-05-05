package com.skillscape.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    @NotBlank private String headline;
    private String description;
}
