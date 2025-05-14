package com.skillscape.backend_new.service;

import com.skillscape.backend_new.dto.*;
import com.skillscape.backend_new.model.*;
import com.skillscape.backend_new.repository.ListingRepository;
import com.skillscape.backend_new.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ListingService {

    private final ListingRepository listingRepo;
    private final OrderRepository   orderRepo;
    private final UserService       userService;

    public ListingService(ListingRepository listingRepo,
                          OrderRepository orderRepo,
                          UserService userService) {
        this.listingRepo  = listingRepo;
        this.orderRepo    = orderRepo;
        this.userService  = userService;
    }

    public ListingResponse createListing(CreateListingRequest dto, String userEmail) {
        UserEntity user = userService.getUserByEmail(userEmail);
        ListingEntity listing = mapToEntity(dto);
        listing.setUser(user);
        return mapToDto(listingRepo.save(listing));
    }

    @Transactional(readOnly = true)
    public ListingResponse getListingById(Long id) {
        return listingRepo.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> getAllListings() {
        return listingRepo.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> getListingsByStatus(Status status) {
        return listingRepo.findByStatus(status)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> getListingsByUserEmail(String email) {
        UserEntity user = userService.getUserByEmail(email);
        return listingRepo.findByUser(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ListingResponse updateListing(Long id, CreateListingRequest dto, String email) {
        ListingEntity listing = listingRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + id));

        if (!listing.getUser().getEmail().equals(email))
            throw new SecurityException("Not authorized");

        copyDtoToEntity(dto, listing);
        return mapToDto(listingRepo.save(listing));
    }

    public void deleteListing(Long id, String email) {
        ListingEntity listing = listingRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + id));

        if (!listing.getUser().getEmail().equals(email))
            throw new SecurityException("Not authorized");

        listingRepo.delete(listing);
    }

    public BidResponse placeBid(BidRequest dto, String bidderEmail) {
        ListingEntity listing = listingRepo.findById(dto.getListingId())
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        UserEntity bidder = userService.getUserByEmail(bidderEmail);

        BidEntity bid = new BidEntity();
        bid.setListing(listing);
        bid.setBidder(bidder);
        bid.setDescription(dto.getDescription());
        bid.setRequestedPrice(dto.getRequestedPrice());

        listing.getBids().add(bid);
        listingRepo.save(listing);

        BidEntity savedBid = listing.getBids().stream()
                .max(Comparator.comparing(BidEntity::getCreatedAt))
                .orElseThrow();

        return mapBidToDto(savedBid);
    }

    @Transactional
public OrderResponse awardBid(Long listingId, Long bidId, String ownerEmail) {
    ListingEntity listing = listingRepo.findById(listingId)
            .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

    if (!listing.getUser().getEmail().equals(ownerEmail))
        throw new SecurityException("Not authorized to award this listing");

    BidEntity bid = listing.getBids().stream()
            .filter(b -> b.getId().equals(bidId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Bid not found on this listing"));

    listing.setStatus(Status.DELIVERED);
    listing.setAwardedToUser(bid.getBidder());
    listingRepo.save(listing);

    OrderEntity order = new OrderEntity();
    order.setBuyer(listing.getUser());
    order.setSeller(bid.getBidder());
    order.setGig(null);
    order.setOrderPrice(bid.getRequestedPrice());
    order.setPriceFixed(listing.isPriceFixed());
    order.setPerHourPricing(listing.isPerHourPricing());
    order.setRequirements(
        listing.getRequirements() != null ? listing.getRequirements() : ""
    );
    order.setExpectedDeliveryDate(listing.getExpectedDeliveryDate());

    order.setUploadUrls(
        listing.getUploadUrls() != null
            ? new ArrayList<>(listing.getUploadUrls())
            : new ArrayList<>()
    );

    order.setPercentage(0);

    OrderEntity saved = orderRepo.save(order);
    return toOrderDto(saved);
}


    private ListingEntity mapToEntity(CreateListingRequest d) {
        ListingEntity e = new ListingEntity();
        copyDtoToEntity(d, e);
        return e;
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

    private ListingResponse mapToDto(ListingEntity e) {
        ListingResponse r = new ListingResponse();
        r.setId(e.getId());
        r.setTitle(e.getTitle());
        r.setDescription(e.getDescription());
        r.setWhatYouGet(e.getWhatYouGet());
        r.setToolsAndTechnology(e.getToolsAndTechnology());
        r.setPrice(e.getPrice());
        r.setPriceFixed(e.isPriceFixed());
        r.setPerHourPricing(e.isPerHourPricing());
        r.setCategory(e.getCategory());
        r.setCoverImageUrl(e.getCoverImageUrl());
        r.setFileUrls(e.getFileUrls());
        r.setDeliveryTimeDays(e.getDeliveryTimeDays());
        r.setLastDeliveryAt(e.getLastDeliveryAt());
        r.setLanguages(e.getLanguages());
        r.setOrderPrice(e.getOrderPrice());
        r.setStatus(e.getStatus());
        r.setRequirements(e.getRequirements());
        r.setExpectedDeliveryDate(e.getExpectedDeliveryDate());

        r.setUserId(e.getUser().getId());
        r.setUserDisplayName(e.getUser().getDisplayName());

        if (e.getAwardedToUser() != null) {
            r.setAwardedToUserId(e.getAwardedToUser().getId());
            r.setAwardedToUserDisplayName(
                e.getAwardedToUser().getDisplayName());
        }

        r.setBids(e.getBids().stream()
               .map(this::mapBidToDto)
               .collect(Collectors.toList()));

        return r;
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

    private OrderResponse toOrderDto(OrderEntity o) {
        OrderResponse r = new OrderResponse();
        r.setId(o.getId());
        r.setGigId(o.getGig() != null ? o.getGig().getId() : null);
        r.setBuyerId(o.getBuyer().getId());
        r.setSellerId(o.getSeller().getId());
        r.setOrderPrice(o.getOrderPrice());
        r.setPriceFixed(o.isPriceFixed());
        r.setPerHourPricing(o.isPerHourPricing());
        r.setStatus(o.getStatus());
        r.setRequirements(o.getRequirements());
        r.setExpectedDeliveryDate(o.getExpectedDeliveryDate());
        r.setDeliveredAt(o.getDeliveredAt());
        r.setUploadUrls(o.getUploadUrls());
        r.setDeliveredUrls(o.getDeliveredUrls());
        r.setPercentage(o.getPercentage());
        r.setCreatedAt(o.getCreatedAt());
        r.setUpdatedAt(o.getUpdatedAt());
        return r;
    }
}