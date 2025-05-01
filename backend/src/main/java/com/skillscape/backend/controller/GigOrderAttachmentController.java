package com.skillscape.backend.controller;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.GigOrderAttachment;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.GigOrderAttachmentService;
import com.skillscape.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.skillscape.backend.service.CoverService;

import java.net.URLConnection;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class GigOrderAttachmentController {

    private final GigOrderAttachmentService service;
    private final UserService userService;
    private final CoverService coverService;

    public GigOrderAttachmentController(GigOrderAttachmentService service,
                                        UserService userService,
                                        CoverService coverService) {
        this.service      = service;
        this.userService  = userService;
        this.coverService = coverService;
    }

    @PostMapping("/{orderId}/attachments")
    public GigOrderAttachment upload(
        @RequestHeader("X-User-Email") String email,
        @PathVariable Long orderId,
        @RequestParam("file") MultipartFile file
    ) throws Exception {
        User me = userService.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found: " + email));
        return service.upload(orderId, file, me);
    }

    @GetMapping("/{orderId}/attachments")
    public List<GigOrderAttachment> list(@PathVariable Long orderId) {
        return service.list(orderId);
    }

    @GetMapping("/attachments/{filename:.+}")
    public ResponseEntity<Resource> download(
        @PathVariable String filename,
        HttpServletRequest request
    ) throws Exception {
        Resource res = coverService.load(filename);

        // dynamic content type
        String ct = request.getServletContext()
                   .getMimeType(res.getFile().getAbsolutePath());
        if (ct == null) ct = URLConnection.guessContentTypeFromName(res.getFilename());
        if (ct == null) ct = "application/octet-stream";

        return ResponseEntity.ok()
            .header("Content-Type", ct)
            .body(res);
    }
}