package com.skillscape.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmitEventRequest {
    @NotBlank
    private String url;
}