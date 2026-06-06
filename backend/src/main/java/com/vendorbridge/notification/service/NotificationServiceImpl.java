package com.vendorbridge.notification.service;

import com.vendorbridge.notification.dto.NotificationEvent;
import com.vendorbridge.notification.dto.NotificationResponse;
import com.vendorbridge.notification.entity.Notification;
import com.vendorbridge.notification.mapper.NotificationMapper;
import com.vendorbridge.notification.repository.NotificationRepository;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.NotificationType;
import com.vendorbridge.shared.exceptions.ResourceNotFoundException;
import com.vendorbridge.user.entity.User;
import com.vendorbridge.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;
    private final EmailService emailService;

    @Override
    @Transactional
    public void processNotificationEvent(NotificationEvent event) {
        log.info("Processing notification event: {}", event);
        
        try {
            User user = userRepository.findById(event.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", event.getUserId()));

            NotificationType type = NotificationType.valueOf(event.getType());

            Notification notification = Notification.builder()
                    .recipient(user)
                    .type(type)
                    .title(event.getTitle())
                    .message(event.getMessage())
                    .referenceId(event.getReferenceId())
                    .read(false)
                    .build();

            notificationRepository.save(notification);

            // Send email if recipient email is provided
            if (event.getRecipientEmail() != null && !event.getRecipientEmail().isEmpty()) {
                emailService.sendNotificationEmail(
                        event.getRecipientEmail(),
                        event.getTitle(),
                        event.getMessage(),
                        event.getAttachmentKey()
                );
            }
        } catch (Exception e) {
            log.error("Failed to process notification event", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getUserNotifications(UUID userId, boolean unreadOnly, Pageable pageable) {
        Page<Notification> page;
        if (unreadOnly) {
            page = notificationRepository.findByRecipientIdAndReadFalse(userId, pageable);
        } else {
            page = notificationRepository.findByRecipientId(userId, pageable);
        }
        return PagedResponse.from(page.map(notificationMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(UUID id, UUID userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
                
        if (!notification.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to user");
        }
        
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }
}
