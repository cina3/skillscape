package com.skillscape.backend.service;

import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.*;
import com.skillscape.backend.repository.JobApplicationAttachmentRepository;
import com.skillscape.backend.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
public class JobApplicationAttachmentService {

    private final JobApplicationAttachmentRepository attachRepo;
    private final JobApplicationRepository appRepo;
    private final CoverService coverService;
    private final NotificationService notiService;

    public JobApplicationAttachmentService(
            JobApplicationAttachmentRepository attachRepo,
            JobApplicationRepository appRepo,
            CoverService coverService,
            NotificationService notiService
    ) {
        this.attachRepo   = attachRepo;
        this.appRepo      = appRepo;
        this.coverService = coverService;
        this.notiService  = notiService;
    }

    public JobApplicationAttachment uploadToApplication(Long appId,
                                                        MultipartFile file,
                                                        User principal) throws Exception {
        JobApplication app = appRepo.findById(appId)
            .orElseThrow(() -> new NotFoundException("Application not found: " + appId));

        boolean isApplicant = app.getApplicant().getId().equals(principal.getId());
        boolean isCreator   = app.getJob().getCreator().getId().equals(principal.getId());
        if (!(isApplicant || isCreator)) {
            throw new IllegalArgumentException("Not authorized to attach");
        }

        if (app.getStatus() != ApplicationStatus.ACCEPTED) {
            throw new IllegalStateException(
                "Cannot upload until application is accepted");
        }

        String stored = coverService.storeCover(file);
        String url    = "/api/applications/attachments/" + stored;

        JobApplicationAttachment att = JobApplicationAttachment.builder()
            .application(app)
            .filename(file.getOriginalFilename())
            .url(url)
            .build();

        return attachRepo.save(att);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationAttachment> listForApplication(Long appId) {
        JobApplication app = appRepo.findById(appId)
            .orElseThrow(() -> new NotFoundException("Application not found: " + appId));
        return attachRepo.findByApplication(app);
    }

    public JobApplicationAttachment upload(Long applicationId,
                                       MultipartFile file,
                                       User principal) throws Exception {
    JobApplication application = appRepo.findById(applicationId)
        .orElseThrow(() -> new NotFoundException("Application not found: " + applicationId));

    String url    = "/api/chat/applications/" + applicationId + "/attachments";
    JobApplicationAttachment att = JobApplicationAttachment.builder()
        .application(application)
        .filename(file.getOriginalFilename())
        .url(url)
        .build();
    att = attachRepo.save(att);

    Long otherId = application.getApplicant().getId().equals(principal.getId())
        ? application.getJob().getCreator().getId()
        : application.getApplicant().getId();
    notiService.notifyUser(
      otherId,
      "NEW_ATTACHMENT",
      principal.getDisplayName() +
        " uploaded a new file on application #" + applicationId,
      "/applications/" + applicationId + "/attachments",
      false
    );

    return att;
}
}