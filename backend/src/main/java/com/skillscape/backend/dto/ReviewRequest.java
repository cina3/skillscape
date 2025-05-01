package com.skillscape.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequest {
    @Min(1) @Max(5)
    private int rating;

    @Size(max = 5000)
    private String comment;
}