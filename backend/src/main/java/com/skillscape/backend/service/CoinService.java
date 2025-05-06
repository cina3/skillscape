package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.CoinTransaction;
import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.CoinTransactionRepository;
import com.skillscape.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CoinService {
    private final UserRepository              userRepo;
    private final CoinTransactionRepository   txnRepo;

    private static final int DAILY_AMOUNT  = 10;
    private static final int STREAK_BONUS  = 100;

    public User adjustBalance(Long userId, int amount, String reason) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: "+userId));

        int newBal = user.getCoinBalance() + amount;
        if (newBal < 0) {
            throw new IllegalArgumentException("Insufficient coins");
        }

        user.setCoinBalance(newBal);
        userRepo.save(user);

        CoinTransaction tx = CoinTransaction.builder()
            .user(user)
            .amount(amount)
            .reason(reason)
            .build();
        txnRepo.save(tx);

        return user;
    }

    @Transactional(readOnly=true)
    public int getBalance(Long userId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: "+userId));
        return user.getCoinBalance();
    }

    @Transactional(readOnly=true)
    public List<CoinTransaction> listTransactions(Long userId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: "+userId));
        return txnRepo.findByUserOrderByCreatedAtDesc(user);
    }

    public DailyClaimResponse claimDaily(Long userId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        LocalDate today     = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        if (today.equals(user.getLastDailyClaimDate())) {
            throw new IllegalStateException("Already claimed today");
        }

        int streak = (yesterday.equals(user.getLastDailyClaimDate()))
                   ? user.getDailyClaimStreak() + 1
                   : 1;

        user.setLastDailyClaimDate(today);
        user.setDailyClaimStreak(streak);
        userRepo.save(user);

        adjustBalance(userId, DAILY_AMOUNT, "Daily claim");

        if (streak >= 7) {
            adjustBalance(userId, STREAK_BONUS, "7-day streak bonus");
            user.setDailyClaimStreak(0);
            userRepo.save(user);
        }

        return new DailyClaimResponse(
            user.getCoinBalance(),
            user.getDailyClaimStreak()
        );
    }

    public static record DailyClaimResponse(
        int balance,
        int streak
    ) {}
}