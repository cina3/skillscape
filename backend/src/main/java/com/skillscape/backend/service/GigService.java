package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.GigStatus;
import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.GigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;
import com.skillscape.backend.specification.GigSpecification;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class GigService {
    private final GigRepository gigRepository;

    private static final Map<GigStatus, Set<GigStatus>> ALLOWED = Map.of(
        GigStatus.OPEN, Set.of(GigStatus.AWARDED, GigStatus.CANCELLED),
        GigStatus.AWARDED, Set.of(GigStatus.IN_PROGRESS, GigStatus.CANCELLED),
        GigStatus.IN_PROGRESS, Set.of(GigStatus.COMPLETED, GigStatus.CANCELLED),
        GigStatus.COMPLETED, Set.of(),    
        GigStatus.CANCELLED, Set.of()    
    );

    public GigService(GigRepository gigRepository) {
        this.gigRepository = gigRepository;
    }

    public Gig createGig(String title,
                         String description,
                         User creator,
                         java.math.BigDecimal price
    ) {
        Gig gig = Gig.builder()
                     .title(title)
                     .description(description)
                     .creator(creator)
                     .price(price)
                     .status(com.skillscape.backend.model.GigStatus.OPEN)
                     .build();
        return gigRepository.save(gig);
    }

    @Transactional(readOnly = true)
    public List<Gig> listAllGigs() {
        return gigRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Gig> listGigsByCreator(User creator) {
        return gigRepository.findByCreator(creator);
    }

    @Transactional(readOnly = true)
    public Gig getGig(Long gigId) {
        return gigRepository.findById(gigId)
            .orElseThrow(() -> new NotFoundException("Gig not found: " + gigId));
    }

    @Transactional(readOnly = true)
    public List<Gig> listGigs(  String titleKeyword,
                                BigDecimal minPrice,
                                BigDecimal maxPrice,
                                GigStatus status
    ) {
        Specification<Gig> spec = Specification.where(GigSpecification.hasTitleLike(titleKeyword))
                                            .and(GigSpecification.priceBetween(minPrice, maxPrice))
                                            .and(GigSpecification.hasStatus(status));

        return gigRepository.findAll(spec);
    }

    public Gig updateGig(Long gigId,
                         String newTitle,
                         String newDescription,
                         java.math.BigDecimal newPrice,
                         User principal
    ) {
        Gig gig = getGig(gigId);
        if (!gig.getCreator().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("Not your gig to update");
        }
        gig.setTitle(newTitle);
        gig.setDescription(newDescription);
        gig.setPrice(newPrice);
        return gigRepository.save(gig);
    }

    public void deleteGig(Long gigId, User principal) {
        Gig gig = getGig(gigId);
        if (!gig.getCreator().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("Not your gig to delete");
        }
        gigRepository.delete(gig);
    }

    public Gig changeStatus(Long gigId, GigStatus newStatus, User principal) {
        Gig gig = gigRepository.findById(gigId)
                                .orElseThrow(() -> new NotFoundException("Gig not found: " + gigId));

        if (!gig.getCreator().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("Not authorized to change status");
        }

        GigStatus current = gig.getStatus();
        if (!ALLOWED.getOrDefault(current, Set.of()).contains(newStatus)) {
            throw new IllegalArgumentException(
                "Cannot transition gig from " + current + " to " + newStatus
            );
        }

        gig.setStatus(newStatus);
        return gigRepository.save(gig);
    }
}