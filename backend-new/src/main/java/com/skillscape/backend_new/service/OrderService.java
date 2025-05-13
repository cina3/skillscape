package com.skillscape.backend_new.service;

import com.skillscape.backend_new.dto.CreateOrderRequest;
import com.skillscape.backend_new.dto.OrderResponse;
import com.skillscape.backend_new.model.*;
import com.skillscape.backend_new.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final GigRepository   gigRepo;
    private final UserRepository  userRepo;

    public OrderService(OrderRepository orderRepo,
                        GigRepository gigRepo,
                        UserRepository userRepo) {
        this.orderRepo = orderRepo;
        this.gigRepo   = gigRepo;
        this.userRepo  = userRepo;
    }

    @Transactional
    public OrderResponse placeOrder(Long buyerId, CreateOrderRequest dto) {
        if (orderRepo.existsByBuyerIdAndGigId(buyerId, dto.getGigId())) {
            throw new IllegalStateException("You can only order this gig once.");
        }

        UserEntity buyer = userRepo.findById(buyerId)
            .orElseThrow(() -> new EntityNotFoundException("Buyer not found"));
        GigEntity gig   = gigRepo.findById(dto.getGigId())
            .orElseThrow(() -> new EntityNotFoundException("Gig not found"));

        BigDecimal price = dto.getRequestedPrice() != null
            ? dto.getRequestedPrice()
            : gig.getPrice();

        OrderEntity order = new OrderEntity();
        order.setBuyer(buyer);
        order.setSeller(gig.getUser());
        order.setGig(gig);
        order.setOrderPrice(price);
        order.setPriceFixed(gig.isPriceFixed());
        order.setPerHourPricing(gig.isPerHourPricing());
        order.setRequirements(dto.getRequirements());
        order.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        order.setUploadUrls(dto.getUploadUrls() != null ? dto.getUploadUrls() : List.of());
        order.setDeliveredUrls(order.getDeliveredUrls() != null ? order.getDeliveredUrls() : List.of());
        order.setPercentage(0);

        OrderEntity saved = orderRepo.save(order);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByBuyer(Long buyerId) {
        UserEntity buyer = userRepo.findById(buyerId)
            .orElseThrow(() -> new EntityNotFoundException("Buyer not found"));
        return orderRepo.findByBuyer(buyer).stream()
                        .map(this::toDto)
                        .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersBySeller(Long sellerId) {
        UserEntity seller = userRepo.findById(sellerId)
            .orElseThrow(() -> new EntityNotFoundException("Seller not found"));
        return orderRepo.findBySeller(seller).stream()
                        .map(this::toDto)
                        .collect(Collectors.toList());
    }

    private OrderResponse toDto(OrderEntity o) {
        OrderResponse dto = new OrderResponse();
        dto.setId(o.getId());
        dto.setGigId(o.getGig().getId());
        dto.setBuyerId(o.getBuyer().getId());
        dto.setSellerId(o.getSeller().getId());
        dto.setOrderPrice(o.getOrderPrice());
        dto.setPriceFixed(o.isPriceFixed());
        dto.setPerHourPricing(o.isPerHourPricing());
        dto.setStatus(o.getStatus());
        dto.setRequirements(o.getRequirements());
        dto.setExpectedDeliveryDate(o.getExpectedDeliveryDate());
        dto.setDeliveredAt(o.getDeliveredAt());
        dto.setUploadUrls(o.getUploadUrls());
        dto.setDeliveredUrls(o.getDeliveredUrls());
        dto.setPercentage(o.getPercentage());
        dto.setCreatedAt(o.getCreatedAt());
        dto.setUpdatedAt(o.getUpdatedAt());
        return dto;
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, Status status) {
        OrderEntity order = orderRepo.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        order.setStatus(status);
        if (status == Status.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        return toDto(orderRepo.save(order));
    }

    @Transactional
    public OrderResponse updateProgress(Long orderId, Integer percentage) {
        OrderEntity order = orderRepo.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        order.setPercentage(percentage);
        return toDto(orderRepo.save(order));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        OrderEntity order = orderRepo.findById(orderId)
            .orElseThrow(() ->
                new EntityNotFoundException("Order not found: " + orderId)
            );
        return toDto(order);
    }
}