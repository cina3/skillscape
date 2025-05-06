package com.skillscape.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateEventRequest {
    @NotBlank private String title;
    private String description;
    @NotNull @Future private LocalDateTime openAt;
    @NotNull @Future private LocalDateTime closeAt;
}