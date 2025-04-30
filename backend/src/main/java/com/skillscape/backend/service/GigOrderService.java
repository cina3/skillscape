package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.GigOrder;
import com.skillscape.backend.model.GigOrderStatus;
import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.GigOrderRepository;
import com.skillscape.backend.repository.GigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class GigOrderService {
    private final GigOrderRepository orderRepo;
    private final GigRepository gigRepo;

    public GigOrderService(GigOrderRepository orderRepo,
                           GigRepository gigRepo) {
        this.orderRepo = orderRepo;
        this.gigRepo   = gigRepo;
    }

    public GigOrder placeOrder(Long gigId,
                               BigDecimal offeredPrice,
                               User customer
    ) {
        Gig gig = gigRepo.findById(gigId)
                .orElseThrow(() -> new NotFoundException("Gig not found: " + gigId));

        if (gig.getCreator().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Cannot order your own gig");
        }

        BigDecimal price = offeredPrice != null ? offeredPrice : gig.getPrice();
        GigOrder order = GigOrder.builder()
                .gig(gig)
                .customer(customer)
                .agreedPrice(price)
                .status(GigOrderStatus.PENDING)
                .build();
        return orderRepo.save(order);
    }

    public GigOrder respondToOrder(Long orderId,
                                   boolean accept,
                                   User freelancer
    ) {
        GigOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        if (!order.getGig().getCreator().getId().equals(freelancer.getId())) {
            throw new IllegalArgumentException("Not authorized to respond to this order");
        }

        order.setStatus(accept ? GigOrderStatus.ACCEPTED : GigOrderStatus.REJECTED);
        return orderRepo.save(order);
    }

    @Transactional(readOnly = true)
    public List<GigOrder> listOrdersByCustomer(User customer) {
        return orderRepo.findByCustomer(customer);
    }

    @Transactional(readOnly = true)
    public List<GigOrder> listOrdersByGig(Long gigId, User freelancer) {
        Gig gig = gigRepo.findById(gigId)
                .orElseThrow(() -> new NotFoundException("Gig not found: " + gigId));

        if (!gig.getCreator().getId().equals(freelancer.getId())) {
            throw new IllegalArgumentException("Not authorized to view orders for this gig");
        }
        return orderRepo.findByGig(gig);
    }
}