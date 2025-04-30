package com.skillscape.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public class PlaceOrderRequest {
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal offeredPrice;

    public BigDecimal getOfferedPrice() {
        return offeredPrice;
    }

    public void setOfferedPrice(BigDecimal offeredPrice) {
        this.offeredPrice = offeredPrice;
    }
}