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
    public GigResponse createGig(GigCreateRequest dto, UserEntity owner) {
        GigEntity g = new GigEntity();
        g.setTitle(dto.getTitle());
        g.setDescription(dto.getDescription());
        g.setWhatYouGet(dto.getWhatYouGet());
        g.setToolsAndTechnology(dto.getToolsAndTechnology());
        g.setPrice(dto.getPrice());
        g.setPriceFixed(dto.getIsPriceFixed());
        g.setPerHourPricing(dto.getIsPerHourPricing());
        g.setCategory(dto.getCategory());
        g.setCoverImageUrl(dto.getCoverImageUrl());
        if (dto.getFileUrls() != null) g.setFileUrls(dto.getFileUrls());
        g.setDeliveryTimeDays(dto.getDeliveryTimeDays());
        g.setLastDeliveryAt(dto.getLastDeliveryAt());
        g.setLanguages(dto.getLanguages());
        g.setUser(owner);

        GigEntity saved = gigRepository.save(g);
        return convertToDTO(saved);
    }

    @Transactional(readOnly = true)
    public GigResponse getGigById(Long id) {
        return gigRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<GigResponse> getAllGigs() {
        return gigRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private GigResponse convertToDTO(GigEntity g) {
        return new GigResponse(
                g.getId(),
                g.getTitle(),
                g.getDescription(),
                g.getPrice(),
                g.isPriceFixed(),
                g.isPerHourPricing(),
                g.getCategory(),
                g.getCoverImageUrl(),
                g.getFileUrls(),
                g.getDeliveryTimeDays(),
                g.getCreatedAt(),
                g.getUpdatedAt(),
                g.getUser().getId(),
                g.getUser().getDisplayName(),
                g.getWhatYouGet(),
                g.getToolsAndTechnology(),
                g.getLastDeliveryAt(),
                g.getLanguages()
        );
    }

    @Transactional(readOnly = true)
    public List<GigResponse> getGigsByOwner(UserEntity owner) {
    return gigRepository.findByUser(owner).stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
    }
}
