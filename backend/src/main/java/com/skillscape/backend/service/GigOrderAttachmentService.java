package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.GigOrder;
import com.skillscape.backend.model.GigOrderAttachment;
import com.skillscape.backend.model.GigOrderStatus;
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
    private final CoverService coverService; 
    public GigOrderAttachmentService(GigOrderAttachmentRepository attachRepo,
                                     GigOrderRepository orderRepo,
                                     CoverService coverService) {
        this.attachRepo   = attachRepo;
        this.orderRepo    = orderRepo;
        this.coverService = coverService;
    }

    public GigOrderAttachment upload(Long orderId,
                                     MultipartFile file,
                                     User principal) throws Exception {
        GigOrder order = orderRepo.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        boolean isCustomer   = order.getCustomer().getId().equals(principal.getId());
        boolean isFreelancer = order.getGig().getCreator().getId().equals(principal.getId());
        if (!(isCustomer || isFreelancer)) {
            throw new IllegalArgumentException("Not authorized to attach to this order");
        }

        if (order.getStatus() != GigOrderStatus.ACCEPTED) {
            throw new IllegalStateException(
                "Cannot upload attachments until order is accepted");
        }

        String stored = coverService.storeCover(file);
        String url    = "/api/orders/attachments/" + stored;

        GigOrderAttachment att = GigOrderAttachment.builder()
            .gigOrder(order)
            .filename(file.getOriginalFilename())
            .url(url)
            .build();

        return attachRepo.save(att);
    }

    @Transactional(readOnly = true)
    public List<GigOrderAttachment> list(Long orderId) {
        GigOrder order = orderRepo.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        return attachRepo.findByGigOrder(order);
    }
}