package com.skillscape.backend_new.dto;

import com.skillscape.backend_new.model.Category;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
public class GigCreateRequest {

    @NotBlank(message = "Title is mandatory")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    private String title;

    @NotBlank(message = "Description is mandatory")
    @Size(min = 20, max = 5000, message = "Description must be between 20 and 5000 characters")
    private String description;

    @NotNull(message = "Price is mandatory")
    @DecimalMin(value = "1.00", message = "Price must be at least 1.00")
    private BigDecimal price;

    @NotNull(message = "Price fixed status is mandatory")
    private Boolean isPriceFixed; 

    @NotNull(message = "Per hour pricing status is mandatory")
    private Boolean isPerHourPricing; 

    @NotNull(message = "Category is mandatory")
    private Category category;

    private String coverImageUrl;

    private List<String> fileUrls = new ArrayList<>();

    @NotNull(message = "Delivery time in days is mandatory")
    @Min(value = 1, message = "Delivery time must be at least 1 day")
    private Integer deliveryTimeDays;

    @Size(max = 5)
    private List<String> whatYouGet;
    private String toolsAndTechnology;
    private LocalDateTime lastDeliveryAt;
    private List<String> languages;
}