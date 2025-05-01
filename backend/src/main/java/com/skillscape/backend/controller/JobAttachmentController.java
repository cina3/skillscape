package com.skillscape.backend.controller;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.JobAttachment;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.CoverService;
import com.skillscape.backend.service.JobAttachmentService;
import com.skillscape.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.net.URLConnection;

@RestController
@RequestMapping("/api")
public class JobAttachmentController {

    private final JobAttachmentService attachService;
    private final UserService userService;
    private final CoverService coverService;

    public JobAttachmentController(JobAttachmentService attachService,
                                   UserService userService,
                                   CoverService coverService) {
        this.attachService = attachService;
        this.userService   = userService;
        this.coverService  = coverService;
    }

    /** Upload a file to a job (showcase attachments). */
    @PostMapping("/jobs/{jobId}/attachments")
    public JobAttachment upload(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long jobId,
        @RequestParam("file") MultipartFile file
    ) throws Exception {
        User user = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        return attachService.upload(jobId, file, user);
    }

    /** List all attachments for a job. */
    @GetMapping("/jobs/{jobId}/attachments")
    public List<JobAttachment> list(@PathVariable Long jobId) {
        return attachService.list(jobId);
    }

    /** Download any stored attachment by filename. */
    @GetMapping("/job-attachments/{filename:.+}")
    public ResponseEntity<Resource> download(
        @PathVariable String filename,
        HttpServletRequest request
    ) throws Exception {
        // use CoverService to load the file as a Resource
        Resource resource = coverService.load(filename);

        // detect MIME type
        String ct = request.getServletContext()
                          .getMimeType(resource.getFile().getAbsolutePath());
        if (ct == null) {
            ct = URLConnection.guessContentTypeFromName(resource.getFilename());
        }
        if (ct == null) {
            ct = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(ct))
            .body(resource);
    }
}