package com.skillscape.backend.repository;

import com.skillscape.backend.model.CoinTransaction;
import com.skillscape.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoinTransactionRepository
        extends JpaRepository<CoinTransaction, Long> {
    List<CoinTransaction> findByUserOrderByCreatedAtDesc(User user);
}