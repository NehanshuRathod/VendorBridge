package com.vendorbridge.shared.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final RabbitTemplate rabbitTemplate;

    private static final String AUDIT_EXCHANGE = "audit.exchange";
    private static final String AUDIT_ROUTING_KEY = "audit.event";

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String action = auditable.action();
        String username = getCurrentUsername();
        String ipAddress = getClientIpAddress();
        String methodName = joinPoint.getSignature().toShortString();

        // Capture arguments before execution (potential "old values" context)
        String argumentsBefore = serializeToJson(joinPoint.getArgs());

        log.debug("Audit START - Action: {}, User: {}, Method: {}, IP: {}", action, username, methodName, ipAddress);

        Object result;
        try {
            result = joinPoint.proceed();
        } catch (Throwable ex) {
            // Publish a failure audit event
            Map<String, Object> failureEvent = buildAuditEvent(
                    action, username, ipAddress, methodName,
                    argumentsBefore, null, "FAILURE", ex.getMessage()
            );
            publishAuditEvent(failureEvent);
            log.warn("Audit FAILURE - Action: {}, User: {}, Error: {}", action, username, ex.getMessage());
            throw ex;
        }

        // Capture result after execution (the "new value")
        String resultAfter = serializeToJson(result);

        Map<String, Object> successEvent = buildAuditEvent(
                action, username, ipAddress, methodName,
                argumentsBefore, resultAfter, "SUCCESS", null
        );
        publishAuditEvent(successEvent);

        log.debug("Audit SUCCESS - Action: {}, User: {}", action, username);

        return result;
    }

    private Map<String, Object> buildAuditEvent(String action, String username, String ipAddress,
                                                  String methodName, String oldValues, String newValues,
                                                  String status, String errorMessage) {
        Map<String, Object> event = new HashMap<>();
        event.put("action", action);
        event.put("username", username);
        event.put("ipAddress", ipAddress);
        event.put("methodName", methodName);
        event.put("oldValues", oldValues);
        event.put("newValues", newValues);
        event.put("status", status);
        event.put("errorMessage", errorMessage);
        event.put("timestamp", Instant.now().toString());
        return event;
    }

    private void publishAuditEvent(Map<String, Object> event) {
        try {
            String eventJson = objectMapper.writeValueAsString(event);
            rabbitTemplate.convertAndSend(AUDIT_EXCHANGE, AUDIT_ROUTING_KEY, eventJson);
            log.debug("Audit event published to RabbitMQ: {}", event.get("action"));
        } catch (Exception ex) {
            // Audit publishing should never break the main flow
            log.error("Failed to publish audit event to RabbitMQ: {}", ex.getMessage(), ex);
        }
    }

    private String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return authentication.getName();
            }
        } catch (Exception ex) {
            log.warn("Could not retrieve current username from SecurityContext: {}", ex.getMessage());
        }
        return "ANONYMOUS";
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception ex) {
            log.warn("Could not retrieve client IP address: {}", ex.getMessage());
        }
        return "UNKNOWN";
    }

    private String serializeToJson(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception ex) {
            log.warn("Failed to serialize object to JSON for audit: {}", ex.getMessage());
            return obj.toString();
        }
    }
}
