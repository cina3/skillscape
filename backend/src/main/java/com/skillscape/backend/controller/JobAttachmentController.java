package com.skillscape.backend.controller;

import com.skillscape.backend.model.JobAttachment;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.JobAttachmentService;
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
public class JobAttachmentController {
    private final JobAttachmentService attachService;
    private final UserService userService;

    public JobAttachmentController(JobAttachmentService attachService,
                                   UserService userService) {
        this.attachService = attachService;
        this.userService   = userService;
    }

    @PostMapping("/jobs/{jobId}/attachments")
    public JobAttachment upload(
            @RequestHeader("X-User-Email") String email,
            @PathVariable Long jobId,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new com.skillscape.backend.exception.NotFoundException("User not found: " + email));
        return attachService.upload(jobId, file, user);
    }

    @GetMapping("/jobs/{jobId}/attachments")
    public List<JobAttachment> list(
            @PathVariable Long jobId
    ) {
        return attachService.list(jobId);
    }

    @GetMapping("/job-attachments/{filename:.+}")
    public Resource download(@PathVariable String filename,
                             HttpServletResponse response) throws Exception {
        Path file = attachService.loadAsPath(filename);
        UrlResource resource = new UrlResource(file.toUri());
        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        return resource;
    }
}