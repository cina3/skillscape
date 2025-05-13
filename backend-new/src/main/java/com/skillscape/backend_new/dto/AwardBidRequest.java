package com.skillscape.backend_new.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AwardBidRequest {
    @NotNull
    private Long bidId;
}