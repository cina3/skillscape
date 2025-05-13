package com.skillscape.backend_new.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.skillscape.backend_new.model.Category;
import com.skillscape.backend_new.model.Status;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CreateListingRequest {

    @NotBlank @Size(min = 5, max = 100)
    private String title;

    @NotBlank @Size(min = 20, max = 5000)
    private String description;

    @NotNull @DecimalMin("1.00")
    private BigDecimal price;

    @NotNull
    @JsonProperty("isPriceFixed")
    private Boolean isPriceFixed;

    @NotNull
    @JsonProperty("isPerHourPricing")
    private Boolean isPerHourPricing;

    @NotNull
    private Category category;

    private String coverImageUrl;

    private List<String> fileUrls = new ArrayList<>();

    @NotNull @Min(1)
    private Integer deliveryTimeDays;

    @Size(max = 5)
    private List<String> whatYouGet;

    private String toolsAndTechnology;

    private LocalDateTime lastDeliveryAt;

    private List<String> languages;

    private BigDecimal orderPrice;
    private Status status;
    private String requirements;
    private LocalDateTime expectedDeliveryDate;
}