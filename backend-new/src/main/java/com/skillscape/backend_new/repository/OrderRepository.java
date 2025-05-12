package com.skillscape.backend_new.repository; 

import com.skillscape.backend_new.model.OrderEntity;
import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.model.GigEntity;
import com.skillscape.backend_new.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByBuyer(UserEntity buyer);

    List<OrderEntity> findBySeller(UserEntity seller);

    List<OrderEntity> findByGig(GigEntity gig);

    List<OrderEntity> findByBuyerAndStatus(UserEntity buyer, Status status);

    List<OrderEntity> findBySellerAndStatus(UserEntity seller, Status status);

    List<OrderEntity> findByGigAndStatus(GigEntity gig, Status status);

    boolean existsByBuyerIdAndGigId(Long buyerId, Long gigId);
}