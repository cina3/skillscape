package com.skillscape.backend_new.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    private Long id;              

    @NotNull
    @Min(0) @Max(5)
    private Integer score;

    private String comment;

    @NotNull
    private Long userId;            

    @NotNull
    private Long gigId;            

    private String createdAt;       
}