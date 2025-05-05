package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.*;
import com.skillscape.backend.repository.*;
import com.skillscape.backend.specification.FreelancerProfileSpecification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class FreelancerProfileService {
    private final FreelancerProfileRepository profileRepo;
    private final PortfolioItemRepository      itemRepo;
    private final UserRepository               userRepo;

    public FreelancerProfileService(FreelancerProfileRepository p,
                                    PortfolioItemRepository   i,
                                    UserRepository            u) {
        this.profileRepo = p;
        this.itemRepo    = i;
        this.userRepo    = u;
    }

    public FreelancerProfile getOrCreateProfile(Long userId) {
        return profileRepo.findByUserId(userId)
            .orElseGet(() -> {
                User user = userRepo.findById(userId)
                    .orElseThrow(() -> new NotFoundException(
                        "User not found: " + userId));
                FreelancerProfile fp = FreelancerProfile.builder()
                    .user(user)
                    .build();
                return profileRepo.save(fp);
            });
    }

    public FreelancerProfile updateProfile(Long userId,
                                            String headline,
                                            String bio) {
        FreelancerProfile fp = getOrCreateProfile(userId);
        fp.setHeadline(headline);
        fp.setBio(bio);
        return profileRepo.save(fp);
    }

    public PortfolioItem addPortfolioItem(Long userId,
                                          String title,
                                          String description,
                                          String url) {
        FreelancerProfile fp = getOrCreateProfile(userId);
        PortfolioItem item = PortfolioItem.builder()
            .profile(fp)
            .title(title)
            .description(description)
            .url(url)
            .build();
        return itemRepo.save(item);
    }

    public List<PortfolioItem> listPortfolio(Long userId) {
        FreelancerProfile fp = getOrCreateProfile(userId);
        return itemRepo.findByProfile(fp);
    }

    public void removePortfolioItem(Long userId, Long itemId) {
        PortfolioItem item = itemRepo.findById(itemId)
            .orElseThrow(() -> new NotFoundException(
                "Portfolio item not found: " + itemId));
        if (!item.getProfile().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not your portfolio item");
        }
        itemRepo.delete(item);
    }

        @Transactional(readOnly = true)
    public Page<FreelancerProfile> searchProfiles(
            String name,
            String headline,
            Double minRating,
            Pageable pageable
    ) {
        Specification<FreelancerProfile> spec = Specification.where(
            FreelancerProfileSpecification.nameLike(name)
        ).and(FreelancerProfileSpecification.headlineLike(headline))
        .and(FreelancerProfileSpecification.minRating(minRating));

        return profileRepo.findAll(spec, pageable);
    }
}