package com.skillscape.backend_new.service;

import com.skillscape.backend_new.dto.GigCreateRequest;
import com.skillscape.backend_new.dto.GigResponse;
import com.skillscape.backend_new.model.GigEntity;
import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.repository.GigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GigService {

    private final GigRepository gigRepository;

    @Autowired
    public GigService(GigRepository gigRepository) {
        this.gigRepository = gigRepository;
    }

    @Transactional
    public GigResponse createGig(GigCreateRequest gigCreateRequestDTO, UserEntity owner) {
        GigEntity gigEntity = new GigEntity();
        gigEntity.setTitle(gigCreateRequestDTO.getTitle());
        gigEntity.setDescription(gigCreateRequestDTO.getDescription());
        gigEntity.setPrice(gigCreateRequestDTO.getPrice());

        gigEntity.setPriceFixed(gigCreateRequestDTO.getIsPriceFixed());
        gigEntity.setPerHourPricing(gigCreateRequestDTO.getIsPerHourPricing());

        gigEntity.setCategory(gigCreateRequestDTO.getCategory());
        gigEntity.setCoverImageUrl(gigCreateRequestDTO.getCoverImageUrl());
        if (gigCreateRequestDTO.getFileUrls() != null) {
            gigEntity.setFileUrls(gigCreateRequestDTO.getFileUrls());
        }
        gigEntity.setDeliveryTimeDays(gigCreateRequestDTO.getDeliveryTimeDays());
        gigEntity.setUser(owner); 

        GigEntity savedGig = gigRepository.save(gigEntity);
        return convertToDTO(savedGig);
    }

    @Transactional(readOnly = true)
    public GigResponse getGigById(Long gigId) {
        return gigRepository.findById(gigId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<GigResponse> getAllGigs() {
        return gigRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GigResponse> getGigsByOwner(UserEntity owner) {
        return gigRepository.findByUser(owner).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    private GigResponse convertToDTO(GigEntity gigEntity) {
        if (gigEntity == null) {
            return null;
        }
        return new GigResponse(
                gigEntity.getId(),
                gigEntity.getTitle(),
                gigEntity.getDescription(),
                gigEntity.getPrice(),
                gigEntity.isPriceFixed(),
                gigEntity.isPerHourPricing(),
                gigEntity.getCategory(),
                gigEntity.getCoverImageUrl(),
                gigEntity.getFileUrls(),
                gigEntity.getDeliveryTimeDays(),
                gigEntity.getCreatedAt(),
                gigEntity.getUpdatedAt(),
                gigEntity.getUser() != null ? gigEntity.getUser().getId() : null,
                gigEntity.getUser() != null ? gigEntity.getUser().getDisplayName() : null
        );
    }
}