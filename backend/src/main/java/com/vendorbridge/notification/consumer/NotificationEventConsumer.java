package com.vendorbridge.notification.consumer;

import com.vendorbridge.notification.dto.NotificationEvent;
import com.vendorbridge.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = "notification.email")
    public void consumeNotificationEvent(NotificationEvent event) {
        log.info("Received notification event from RabbitMQ: {}", event.getType());
        try {
            notificationService.processNotificationEvent(event);
        } catch (Exception e) {
            log.error("Failed to process notification event from queue", e);
            // In a production environment, we might want to implement a dead-letter queue (DLQ)
            // or retry mechanism here, but for now we just log the error to prevent poisoning
        }
    }
}
