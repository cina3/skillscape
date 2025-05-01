package com.skillscape.backend.dto;

import jakarta.validation.constraints.NotNull;

public class RespondApplicationRequest {
    @NotNull
    private Boolean accept;

    public Boolean getAccept() { return accept; }
    public void setAccept(Boolean a) { this.accept = a; }
}