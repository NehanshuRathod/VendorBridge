package com.vendorbridge.notification.service;

import com.vendorbridge.config.MailConfig;
import com.vendorbridge.rfq.service.MinioStorageService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final MinioStorageService minioStorageService;
    private final MailConfig mailConfig;

    public void sendNotificationEmail(String to, String subject, String message, String attachmentKey) {
        if (!mailConfig.isEnabled()) {
            log.info("Email sending is disabled by configuration. Skipping notification to {}", to);
            return;
        }
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);

            Context context = new Context();
            context.setVariable("title", subject);
            context.setVariable("message", message);
            
            String htmlContent = templateEngine.process("notification-email", context);
            helper.setText(htmlContent, true);

            if (attachmentKey != null && !attachmentKey.isEmpty()) {
                try {
                    InputStream fileStream = minioStorageService.downloadFile("vendorbridge", attachmentKey);
                    byte[] bytes = fileStream.readAllBytes();
                    String filename = attachmentKey.substring(attachmentKey.lastIndexOf("/") + 1);
                    helper.addAttachment(filename, new ByteArrayResource(bytes));
                } catch (Exception e) {
                    log.error("Failed to attach file {} to email", attachmentKey, e);
                }
            }

            mailSender.send(mimeMessage);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
        }
    }
}
