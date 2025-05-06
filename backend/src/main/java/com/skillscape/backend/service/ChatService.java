package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.*;
import com.skillscape.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ChatService {
    private final ChatMessageRepository msgRepo;
    private final GigOrderRepository    orderRepo;
    private final JobApplicationRepository appRepo;

    public ChatService(ChatMessageRepository msgRepo,
                       GigOrderRepository orderRepo,
                       JobApplicationRepository appRepo) {
        this.msgRepo   = msgRepo;
        this.orderRepo = orderRepo;
        this.appRepo   = appRepo;
    }

    public List<ChatMessage> listOrderMessages(Long orderId, User user) {
        GigOrder order = orderRepo.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        if (!order.getCustomer().getId().equals(user.getId()) &&
            !order.getGig().getCreator().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized");
        }
        return msgRepo.findByTypeAndParentIdOrderBySentAtAsc(
            ChatType.ORDER, orderId);
    }

    public ChatMessage sendOrderMessage(Long orderId, User user, String text) {
        GigOrder order = orderRepo.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        if (!order.getCustomer().getId().equals(user.getId()) &&
            !order.getGig().getCreator().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized");
        }
        ChatMessage msg = ChatMessage.builder()
            .type(ChatType.ORDER)
            .parentId(orderId)
            .sender(user)
            .text(text)
            .build();
        return msgRepo.save(msg);
    }

    public List<ChatMessage> listApplicationMessages(Long appId, User user) {
        JobApplication app = appRepo.findById(appId)
            .orElseThrow(() -> new NotFoundException("Application not found: " + appId));
        if (!app.getApplicant().getId().equals(user.getId()) &&
            !app.getJob().getCreator().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized");
        }
        return msgRepo.findByTypeAndParentIdOrderBySentAtAsc(
            ChatType.APPLICATION, appId);
    }

    public ChatMessage sendApplicationMessage(Long appId, User user, String text) {
        JobApplication app = appRepo.findById(appId)
            .orElseThrow(() -> new NotFoundException("Application not found: " + appId));
        if (!app.getApplicant().getId().equals(user.getId()) &&
            !app.getJob().getCreator().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized");
        }
        ChatMessage msg = ChatMessage.builder()
            .type(ChatType.APPLICATION)
            .parentId(appId)
            .sender(user)
            .text(text)
            .build();
        return msgRepo.save(msg);
    }
}