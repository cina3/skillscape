package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.GigAttachment;
import com.skillscape.backend.model.User;
import com.skillscape.backend.repository.GigAttachmentRepository;
import com.skillscape.backend.repository.GigRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class GigAttachmentService {
    private final GigAttachmentRepository attachRepo;
    private final GigRepository gigRepo;
    private final Path uploadRoot;

    public GigAttachmentService(
        GigAttachmentRepository attachRepo,
        GigRepository gigRepo,
        @Value("${attachments.upload-dir}") String uploadDir
    ) throws IOException {
        this.attachRepo = attachRepo;
        this.gigRepo    = gigRepo;
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadRoot);
    }

    public GigAttachment upload(Long gigId,
                                MultipartFile file,
                                User principal) throws IOException 
    {
        Gig gig = gigRepo.findById(gigId)
                         .orElseThrow(() -> new NotFoundException("Gig not found: " + gigId));

        if (!gig.getCreator().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("Not your gig");
        }

        String ext = "";
        String orig = file.getOriginalFilename();
        int i = orig != null ? orig.lastIndexOf('.') : -1;
        if (i > 0) ext = orig.substring(i);
        String storedName = UUID.randomUUID() + ext;

        Path target = uploadRoot.resolve(storedName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        GigAttachment attach = GigAttachment.builder()
            .gig(gig)
            .filename(orig)
            .url("/api/attachments/" + storedName)
            .build();

        return attachRepo.save(attach);
    }

    @Transactional(readOnly = true)
    public List<GigAttachment> listAttachments(Long gigId) {
        Gig gig = gigRepo.findById(gigId)
                          .orElseThrow(() -> new NotFoundException("Gig not found: " + gigId));
        return attachRepo.findByGig(gig);
    }

    public Path loadAsPath(String storedFilename) {
        Path file = uploadRoot.resolve(storedFilename).normalize();
        if (!Files.exists(file)) {
            throw new NotFoundException("File not found: " + storedFilename);
        }
        return file;
    }

    @Transactional(readOnly = true)
    public List<GigAttachment> listForGig(Long gigId) {
        Gig gig = gigRepo.findById(gigId)
            .orElseThrow(() -> new NotFoundException("Gig not found: " + gigId));
        return attachRepo.findByGig(gig);
    }
}