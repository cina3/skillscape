package com.skillscape.backend_new.service;

import com.skillscape.backend_new.dto.BidRequest;
import com.skillscape.backend_new.dto.BidResponse;
import com.skillscape.backend_new.dto.CreateListingRequest;
import com.skillscape.backend_new.dto.ListingResponse;
import com.skillscape.backend_new.model.BidEntity;
import com.skillscape.backend_new.model.ListingEntity;
import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.repository.ListingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ListingService {

    private final ListingRepository repo;
    private final UserService userService;

    public ListingService(ListingRepository repo, UserService userService) {
        this.repo = repo;
        this.userService = userService;
    }

    public ListingResponse createListing(CreateListingRequest dto, String userEmail) {
        UserEntity user = userService.getUserByEmail(userEmail);
        ListingEntity l = mapToEntity(dto);
        l.setUser(user);
        ListingEntity saved = repo.save(l);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public ListingResponse getListingById(Long id) {
        return repo.findById(id)
                   .map(this::mapToDto)
                   .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> getAllListings() {
        return repo.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> getListingsByUserEmail(String userEmail) {
        UserEntity user = userService.getUserByEmail(userEmail);
        return repo.findByUser(user) 
                   .stream()
                   .map(this::mapToDto)
                   .collect(Collectors.toList());
    }

    public ListingResponse updateListing(Long id, CreateListingRequest dto, String userEmail) {
        ListingEntity l = repo.findById(id)
                              .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + id));
        if (!l.getUser().getEmail().equals(userEmail)) {
            throw new SecurityException("Not authorized");
        }
        copyDtoToEntity(dto, l);
        return mapToDto(repo.save(l));
    }

    public void deleteListing(Long id, String userEmail) {
        ListingEntity l = repo.findById(id)
                              .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + id));
        if (!l.getUser().getEmail().equals(userEmail)) {
            throw new SecurityException("Not authorized");
        }
        repo.delete(l);
    }

    private void copyDtoToEntity(CreateListingRequest d, ListingEntity l) {
        l.setTitle(d.getTitle());
        l.setDescription(d.getDescription());
        l.setWhatYouGet(d.getWhatYouGet());
        l.setToolsAndTechnology(d.getToolsAndTechnology());
        l.setPrice(d.getPrice());
        l.setPriceFixed(d.getIsPriceFixed());
        l.setPerHourPricing(d.getIsPerHourPricing());
        l.setCategory(d.getCategory());
        l.setCoverImageUrl(d.getCoverImageUrl());
        l.setFileUrls(d.getFileUrls());
        l.setDeliveryTimeDays(d.getDeliveryTimeDays());
        l.setLastDeliveryAt(d.getLastDeliveryAt());
        l.setLanguages(d.getLanguages());
        l.setOrderPrice(d.getOrderPrice());
        l.setStatus(d.getStatus());
        l.setRequirements(d.getRequirements());
        l.setExpectedDeliveryDate(d.getExpectedDeliveryDate());
    }

    private ListingEntity mapToEntity(CreateListingRequest dto) {
        ListingEntity entity = new ListingEntity();
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setWhatYouGet(dto.getWhatYouGet());
        entity.setToolsAndTechnology(dto.getToolsAndTechnology());
        entity.setPrice(dto.getPrice());
        entity.setPriceFixed(dto.getIsPriceFixed());
        entity.setPerHourPricing(dto.getIsPerHourPricing());
        entity.setCategory(dto.getCategory());
        entity.setCoverImageUrl(dto.getCoverImageUrl());
        entity.setFileUrls(dto.getFileUrls());
        entity.setDeliveryTimeDays(dto.getDeliveryTimeDays());
        entity.setLastDeliveryAt(dto.getLastDeliveryAt());
        entity.setLanguages(dto.getLanguages());
        entity.setOrderPrice(dto.getOrderPrice());
        entity.setStatus(dto.getStatus());
        entity.setRequirements(dto.getRequirements());
        entity.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        return entity;
    }

    private ListingResponse mapToDto(ListingEntity entity) {
        ListingResponse dto = new ListingResponse();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setWhatYouGet(entity.getWhatYouGet());
        dto.setToolsAndTechnology(entity.getToolsAndTechnology());
        dto.setPrice(entity.getPrice());
        dto.setPriceFixed(entity.isPriceFixed());
        dto.setPerHourPricing(entity.isPerHourPricing());
        dto.setCategory(entity.getCategory());
        dto.setCoverImageUrl(entity.getCoverImageUrl());
        dto.setFileUrls(entity.getFileUrls());
        dto.setDeliveryTimeDays(entity.getDeliveryTimeDays());
        dto.setLastDeliveryAt(entity.getLastDeliveryAt());
        dto.setLanguages(entity.getLanguages());
        dto.setOrderPrice(entity.getOrderPrice());
        dto.setStatus(entity.getStatus());
        dto.setRequirements(entity.getRequirements());
        dto.setExpectedDeliveryDate(entity.getExpectedDeliveryDate());
        return dto;
    }

    public BidResponse placeBid(BidRequest dto, String userEmail) {
        ListingEntity listing = repo.findById(dto.getListingId())
            .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        UserEntity bidder = userService.getUserByEmail(userEmail);

        BidEntity bid = new BidEntity();
        bid.setListing(listing);
        bid.setBidder(bidder);
        bid.setDescription(dto.getDescription());
        bid.setRequestedPrice(dto.getRequestedPrice());

        listing.getBids().add(bid);
        ListingEntity saved = repo.save(listing);

        BidEntity savedBid = saved.getBids()
            .stream()
            .max(Comparator.comparing(BidEntity::getCreatedAt))
            .get();

        return mapBidToDto(savedBid);
    }

    private BidResponse mapBidToDto(BidEntity b) {
        BidResponse r = new BidResponse();
        r.setId(b.getId());
        r.setBidderId(b.getBidder().getId());
        r.setBidderDisplayName(b.getBidder().getDisplayName());
        r.setDescription(b.getDescription());
        r.setRequestedPrice(b.getRequestedPrice());
        r.setCreatedAt(b.getCreatedAt());
        return r;
    }
}