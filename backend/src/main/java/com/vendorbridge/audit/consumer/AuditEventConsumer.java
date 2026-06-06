package com.vendorbridge.audit.consumer;

import com.vendorbridge.audit.dto.AuditEvent;
import com.vendorbridge.audit.entity.AuditLog;
import com.vendorbridge.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditEventConsumer {

    private final AuditLogRepository auditLogRepository;

    @RabbitListener(queues = "audit.log")
    public void consumeAuditEvent(AuditEvent event) {
        log.debug("Received audit event from RabbitMQ: {}", event.getAction());
        try {
            AuditLog auditLog = AuditLog.builder()
                    .action(event.getAction())
                    .entityName(event.getEntityName())
                    .entityId(event.getEntityId())
                    .performedBy(event.getPerformedBy())
                    .ipAddress(event.getIpAddress())
                    .oldValues(event.getOldValues())
                    .newValues(event.getNewValues())
                    .timestamp(event.getTimestamp())
                    .build();
                    
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log from queue", e);
        }
    }
}
