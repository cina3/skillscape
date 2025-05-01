package com.skillscape.backend.controller;

import com.skillscape.backend.model.GigAttachment;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.GigAttachmentService;
import com.skillscape.backend.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api")
@Validated
public class GigAttachmentController {
    private final GigAttachmentService attachService;
    private final UserService userService;

    public GigAttachmentController(GigAttachmentService attachService,
                                   UserService userService
    ) {
        this.attachService = attachService;
        this.userService   = userService;
    }

    @PostMapping("/gigs/{gigId}/attachments")
    public GigAttachment upload(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long gigId,
        @RequestParam("file") MultipartFile file
    ) throws Exception {
        User user = userService.findByEmail(email)
                               .orElseThrow(() -> new com.skillscape.backend.exception.NotFoundException("User not found: " + email));
        return attachService.upload(gigId, file, user);
    }

    @GetMapping("/gigs/{gigId}/attachments")
    public List<GigAttachment> list(
            @PathVariable Long gigId
    ) {
        return attachService.listAttachments(gigId);
    }

    @GetMapping("/attachments/{filename:.+}")
    public Resource download(@PathVariable String filename,
                             HttpServletResponse response) throws Exception 
    {
        Path file = attachService.loadAsPath(filename);
        UrlResource resource = new UrlResource(file.toUri());
        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        return resource;
    }
}