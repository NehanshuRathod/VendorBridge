package com.vendorbridge.audit.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AuditLogResponse {
    private UUID id;
    private String action;
    private String entityName;
    private String entityId;
    private String performedBy;
    private String ipAddress;
    private String oldValues;
    private String newValues;
    private LocalDateTime timestamp;
}
