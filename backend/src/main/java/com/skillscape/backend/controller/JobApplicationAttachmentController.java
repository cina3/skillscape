package com.skillscape.backend.controller;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.JobApplicationAttachment;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.CoverService;
import com.skillscape.backend.service.JobApplicationAttachmentService;
import com.skillscape.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.net.URLConnection;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationAttachmentController {

    private final JobApplicationAttachmentService service;
    private final UserService userService;
    private final CoverService coverService;

    public JobApplicationAttachmentController(
            JobApplicationAttachmentService service,
            UserService userService,
            CoverService coverService
    ) {
        this.service      = service;
        this.userService  = userService;
        this.coverService = coverService;
    }

    @PostMapping("/{appId}/attachments")
    public JobApplicationAttachment upload(
            @RequestHeader("X-User-Email") String email,
            @PathVariable Long appId,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        User me = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        return service.uploadToApplication(appId, file, me);
    }

    @GetMapping("/{appId}/attachments")
    public List<JobApplicationAttachment> list(
            @PathVariable Long appId
    ) {
        return service.listForApplication(appId);
    }

    @GetMapping("/attachments/{filename:.+}")
    public ResponseEntity<Resource> download(
            @PathVariable String filename,
            HttpServletRequest request
    ) throws Exception {
        Resource resource = coverService.load(filename);

        String contentType = request.getServletContext()
            .getMimeType(resource.getFile().getAbsolutePath());
        if (contentType == null) {
            contentType = URLConnection.guessContentTypeFromName(resource.getFilename());
        }
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .body(resource);
    }
}