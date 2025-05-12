package com.skillscape.backend_new.dto;

import com.skillscape.backend_new.model.Category;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GigResponse {

    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private boolean isPriceFixed;
    private boolean isPerHourPricing;
    private Category category;
    private String coverImageUrl;
    private List<String> fileUrls = new ArrayList<>();
    private Integer deliveryTimeDays;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId; 
    private String userDisplayName; 

}