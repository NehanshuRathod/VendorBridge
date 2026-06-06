package com.vendorbridge.notification.dto;

import com.vendorbridge.shared.enums.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class NotificationResponse {
    private UUID id;
    private UUID recipientId;
    private NotificationType type;
    private String title;
    private String message;
    private String referenceId;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
