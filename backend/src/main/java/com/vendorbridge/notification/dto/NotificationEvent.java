package com.vendorbridge.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private UUID userId;
    private String type;
    private String title;
    private String message;
    private String recipientEmail;
    private String referenceId;
    private String attachmentKey;
    private Map<String, Object> additionalData;
}
