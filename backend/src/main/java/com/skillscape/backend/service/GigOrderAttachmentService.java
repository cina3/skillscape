package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.GigOrder;
import com.skillscape.backend.model.GigOrderAttachment;
import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.GigOrderAttachmentRepository;
import com.skillscape.backend.repository.GigOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
public class GigOrderAttachmentService {

    private final GigOrderAttachmentRepository attachRepo;
    private final GigOrderRepository orderRepo;
    private final NotificationService notiService;
    public GigOrderAttachmentService(GigOrderAttachmentRepository attachRepo,
                                     GigOrderRepository orderRepo,
                                     NotificationService notiService) {
        this.attachRepo   = attachRepo;
        this.orderRepo    = orderRepo;
        this.notiService  = notiService;
    }

    public GigOrderAttachment upload(Long orderId,
        MultipartFile file,
        User principal) throws Exception {
        GigOrder order = orderRepo.findById(orderId)
        .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        String url    = "/api/chat/orders/" + orderId + "/attachments";
        GigOrderAttachment att = GigOrderAttachment.builder()
        .gigOrder(order)
        .filename(file.getOriginalFilename())
        .url(url)
        .build();
        att = attachRepo.save(att);

        Long otherId = order.getCustomer().getId().equals(principal.getId())
        ? order.getGig().getCreator().getId()
        : order.getCustomer().getId();
        notiService.notifyUser(
        otherId,
        "NEW_ATTACHMENT",
        principal.getDisplayName() +
        " uploaded a new file on order #" + orderId,
        "/orders/" + orderId + "/attachments",
        false
        );

        return att;
}

    @Transactional(readOnly = true)
    public List<GigOrderAttachment> list(Long orderId) {
        GigOrder order = orderRepo.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        return attachRepo.findByGigOrder(order);
    }
}