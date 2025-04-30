package com.skillscape.backend.dto;

import jakarta.validation.constraints.NotNull;

public class RespondOrderRequest {
    @NotNull
    private Boolean accept;

    public Boolean getAccept() {
        return accept;
    }

    public void setAccept(Boolean accept) {
        this.accept = accept;
    }
}