package com.skillscape.backend.controller;

import com.skillscape.backend.dto.PlaceOrderRequest;
import com.skillscape.backend.dto.RespondOrderRequest;
import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.GigOrder;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.GigOrderService;
import com.skillscape.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@Validated
public class GigOrderController {

    private final GigOrderService orderService;
    private final UserService userService;

    public GigOrderController(GigOrderService orderService,
                              UserService userService
    ) {
        this.orderService = orderService;
        this.userService  = userService;
    }

    @PostMapping("/gigs/{gigId}/orders")
    public ResponseEntity<GigOrder> placeOrder(
            @RequestHeader("X-User-Email") String email,
            @PathVariable Long gigId,
           @Valid @RequestBody PlaceOrderRequest req
    ) {
        User customer = userService.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));

        GigOrder order = orderService.placeOrder(
                gigId,
                req.getOfferedPrice(),
                customer
        );
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @PutMapping("/orders/{orderId}/respond")
    public GigOrder respondToOrder(
            @RequestHeader("X-User-Email") String email,
            @PathVariable Long orderId,
            @Valid @RequestBody RespondOrderRequest req
    ) {
        User freelancer = userService.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));

        return orderService.respondToOrder(
                orderId,
                req.getAccept(),
                freelancer
        );
    }

    @GetMapping("/orders")
    public List<GigOrder> listMyOrders(
            @RequestHeader("X-User-Email") String email
    ) {
        User customer = userService.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));

        return orderService.listOrdersByCustomer(customer);
    }

    @GetMapping("/gigs/{gigId}/orders")
    public List<GigOrder> listOrdersForGig(
            @RequestHeader("X-User-Email") String email,
            @PathVariable Long gigId
    ) {
        User freelancer = userService.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));

        return orderService.listOrdersByGig(gigId, freelancer);
    }
}