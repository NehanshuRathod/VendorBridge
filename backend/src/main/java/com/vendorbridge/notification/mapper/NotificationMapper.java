package com.vendorbridge.notification.mapper;

import com.vendorbridge.notification.dto.NotificationResponse;
import com.vendorbridge.notification.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    @Mapping(target = "recipientId", source = "recipient.id")
    NotificationResponse toResponse(Notification notification);

    List<NotificationResponse> toResponseList(List<Notification> notifications);
}
