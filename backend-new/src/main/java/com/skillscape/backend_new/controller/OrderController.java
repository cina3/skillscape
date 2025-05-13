package com.skillscape.backend_new.controller;

import com.skillscape.backend_new.dto.CreateOrderRequest;
import com.skillscape.backend_new.dto.OrderResponse;
import com.skillscape.backend_new.model.Status;
import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.repository.UserRepository;
import com.skillscape.backend_new.service.OrderService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService   orderService;
    private final UserRepository userRepo;

    public OrderController(OrderService orderService,
                           UserRepository userRepo) {
        this.orderService = orderService;
        this.userRepo     = userRepo;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
        Principal principal,
        @Valid @RequestBody CreateOrderRequest request
    ) {
        UserEntity buyer = userRepo.findByEmail(principal.getName())
            .orElseThrow(() ->
              new EntityNotFoundException("User not found: " + principal.getName())
            );

        OrderResponse response = orderService.placeOrder(buyer.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my") 
    public ResponseEntity<List<OrderResponse>> myPurchases(Principal principal) {
        UserEntity buyer = userRepo.findByEmail(principal.getName())
            .orElseThrow(() ->
              new EntityNotFoundException("User not found: " + principal.getName())
            );

        List<OrderResponse> list = orderService.getOrdersByBuyer(buyer.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/seller")
    public ResponseEntity<List<OrderResponse>> mySales(Principal principal) {
        UserEntity seller = userRepo.findByEmail(principal.getName())
            .orElseThrow(() ->
              new EntityNotFoundException("User not found: " + principal.getName())
            );

        List<OrderResponse> list = orderService.getOrdersBySeller(seller.getId());
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateStatus(
        @PathVariable Long orderId,
        @RequestParam("status") Status status
    ) {
        OrderResponse updated = orderService.updateStatus(orderId, status);
        return ResponseEntity.ok(updated);
    }
}