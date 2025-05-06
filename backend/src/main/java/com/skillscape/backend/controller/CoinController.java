package com.skillscape.backend.controller;

import com.skillscape.backend.model.CoinTransaction;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.CoinService;
import com.skillscape.backend.service.UserService;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank; 
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users/me/coins")
@RequiredArgsConstructor
public class CoinController {
    private final CoinService coinService;
    private final UserService userService;

    @GetMapping("/balance")
    public int getBalance(@AuthenticationPrincipal UserDetails ud) {
        User u = userService.findByEmail(ud.getUsername())
                 .orElseThrow();
        return coinService.getBalance(u.getId());
    }

    @GetMapping("/transactions")
    public List<CoinTransaction> listTransactions(
        @AuthenticationPrincipal UserDetails ud
    ) {
        User u = userService.findByEmail(ud.getUsername())
                 .orElseThrow();
        return coinService.listTransactions(u.getId());
    }

    @Data
    public static class AdjustRequest {
        @Min(-100000) 
        private int amount;
        @NotBlank
        private String reason;
    }

    @PostMapping("/adjust")
    public ResponseEntity<Integer> adjust(
        @AuthenticationPrincipal UserDetails ud,
        @RequestBody AdjustRequest req    // ← no @Data here
    ) {
        User u = userService.findByEmail(ud.getUsername())
                 .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User updated = coinService.adjustBalance(
            u.getId(), req.getAmount(), req.getReason());
        return ResponseEntity.ok(updated.getCoinBalance());
    }
}