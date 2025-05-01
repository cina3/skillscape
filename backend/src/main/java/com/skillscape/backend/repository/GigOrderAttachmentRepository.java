package com.skillscape.backend.repository;

import com.skillscape.backend.model.GigOrder;
import com.skillscape.backend.model.GigOrderAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GigOrderAttachmentRepository
        extends JpaRepository<GigOrderAttachment, Long> {

    List<GigOrderAttachment> findByGigOrder(GigOrder gigOrder);
}