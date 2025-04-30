package com.skillscape.backend.repository;

import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.GigOrder;
import com.skillscape.backend.model.GigOrderStatus;
import com.skillscape.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GigOrderRepository extends JpaRepository<GigOrder, Long> {
    List<GigOrder> findByGig(Gig gig);
    List<GigOrder> findByCustomer(User customer);
    List<GigOrder> findByGigAndStatus(Gig gig, GigOrderStatus status);
}