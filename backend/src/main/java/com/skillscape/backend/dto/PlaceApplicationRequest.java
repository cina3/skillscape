package com.skillscape.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public class PlaceApplicationRequest {
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal proposedBudget;
    public BigDecimal getProposedBudget() { return proposedBudget; }
    public void setProposedBudget(BigDecimal b) { this.proposedBudget = b; }
}