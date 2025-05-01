package com.skillscape.backend.repository;

import com.skillscape.backend.model.GigAttachment;
import com.skillscape.backend.model.Gig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GigAttachmentRepository extends JpaRepository<GigAttachment, Long> {
    List<GigAttachment> findByGig(Gig gig);
}