package com.skillscape.backend_new.dto;

import com.skillscape.backend_new.model.Category;
import com.skillscape.backend_new.model.Status;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ListingResponse {
    private Long id;

    private String title;
    private String description;
    private List<String> whatYouGet;
    private String toolsAndTechnology;
    private BigDecimal price;
    private boolean isPriceFixed;
    private boolean isPerHourPricing;
    private Category category;
    private String coverImageUrl;
    private List<String> fileUrls;
    private Integer deliveryTimeDays;
    private LocalDateTime lastDeliveryAt;
    private List<String> languages;

    private BigDecimal orderPrice;
    private Status status;
    private String requirements;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime deliveredAt;
    private List<String> uploadUrls;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long userId;
    private String userDisplayName;
    private Long awardedToUserId;
    private String awardedToUserDisplayName;
    private List<BidResponse> bids;
}