package com.skillscape.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TextRequest {
    @NotBlank
    private String text;
}