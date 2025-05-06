package com.skillscape.backend.controller;

import com.skillscape.backend.dto.TextRequest;
import com.skillscape.backend.model.ChatMessage;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.ChatService;
import com.skillscape.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService  chatService;
    private final UserService  userService;

    public ChatController(ChatService chatService,
                          UserService userService) {
        this.chatService = chatService;
        this.userService = userService;
    }

    @GetMapping("/orders/{orderId}/messages")
    public List<ChatMessage> getOrderMessages(
        @AuthenticationPrincipal UserDetails ud,
        @PathVariable Long orderId
    ) {
        User u = userService.findByEmail(ud.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return chatService.listOrderMessages(orderId, u);
    }

    @PostMapping("/orders/{orderId}/messages")
    public ResponseEntity<ChatMessage> postOrderMessage(
        @AuthenticationPrincipal UserDetails ud,
        @PathVariable Long orderId,
        @Valid @RequestBody TextRequest req
    ) {
        User u = userService.findByEmail(ud.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ChatMessage sent = chatService.sendOrderMessage(orderId, u, req.getText());
        return ResponseEntity.ok(sent);
    }

    @GetMapping("/applications/{appId}/messages")
    public List<ChatMessage> getApplicationMessages(
        @AuthenticationPrincipal UserDetails ud,
        @PathVariable("appId") Long appId
    ) {
        User u = userService.findByEmail(ud.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return chatService.listApplicationMessages(appId, u);
    }

    @PostMapping("/applications/{appId}/messages")
    public ResponseEntity<ChatMessage> postApplicationMessage(
        @AuthenticationPrincipal UserDetails ud,
        @PathVariable("appId") Long appId,
        @Valid @RequestBody TextRequest req
    ) {
        User u = userService.findByEmail(ud.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ChatMessage sent = chatService.sendApplicationMessage(appId, u, req.getText());
        return ResponseEntity.ok(sent);
    }
}