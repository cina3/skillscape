package com.skillscape.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendResetLink(String to, String link) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("[Skillscape] Password reset");
        msg.setText(
            "Click the link below (or paste it into your browser) to reset your password:\n\n"
            + link + "\n\nIf you didn’t request this, ignore this email."
        );
        mailSender.send(msg);
    }
}