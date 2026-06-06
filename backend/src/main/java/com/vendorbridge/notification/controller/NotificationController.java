package com.vendorbridge.notification.controller;

import com.vendorbridge.auth.security.CustomUserDetails;
import com.vendorbridge.notification.dto.NotificationResponse;
import com.vendorbridge.notification.service.NotificationService;
import com.vendorbridge.shared.dto.ApiResponse;
import com.vendorbridge.shared.dto.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<PagedResponse<NotificationResponse>> getMyNotifications(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            Pageable pageable) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ApiResponse.success("Notifications retrieved successfully", 
                notificationService.getUserNotifications(userDetails.getUser().getId(), unreadOnly, pageable));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ApiResponse.success("Unread count retrieved successfully", 
                notificationService.getUnreadCount(userDetails.getUser().getId()));
    }

    @PostMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable UUID id) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        notificationService.markAsRead(id, userDetails.getUser().getId());
        return ApiResponse.success("Notification marked as read", null);
    }

    @PostMapping("/read-all")
    public ApiResponse<Void> markAllAsRead() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        notificationService.markAllAsRead(userDetails.getUser().getId());
        return ApiResponse.success("All notifications marked as read", null);
    }
}
