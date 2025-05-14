package com.skillscape.backend_new.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendPasswordResetEmail(String toEmail, String resetLink) {

        logger.info("----------------------------------------------------");
        logger.info("SIMULATING SENDING PASSWORD RESET EMAIL");
        logger.info("To: {}", toEmail);
        logger.info("Subject: Password Reset Request - SkillScape");
        logger.info("Body:");
        logger.info("Hello,");
        logger.info("You requested a password reset for your SkillScape account.");
        logger.info("Please click the link below to reset your password:");
        logger.info(resetLink);
        logger.info("If you did not request this, please ignore this email.");
        logger.info("This link will expire in 60 minutes.");
        logger.info("Thanks,");
        logger.info("The SkillScape Team");
        logger.info("----------------------------------------------------");

        System.out.println("Mock email sent to " + toEmail + " with link: " + resetLink);
    }

}