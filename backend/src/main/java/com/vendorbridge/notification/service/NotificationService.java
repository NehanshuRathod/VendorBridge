package com.vendorbridge.notification.service;

import com.vendorbridge.notification.dto.NotificationEvent;
import com.vendorbridge.notification.dto.NotificationResponse;
import com.vendorbridge.shared.dto.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {
    void processNotificationEvent(NotificationEvent event);
    PagedResponse<NotificationResponse> getUserNotifications(UUID userId, boolean unreadOnly, Pageable pageable);
    long getUnreadCount(UUID userId);
    void markAsRead(UUID id, UUID userId);
    void markAllAsRead(UUID userId);
}
