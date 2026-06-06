package com.vendorbridge.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEvent {
    private String action;
    private String entityName;
    private String entityId;
    private String performedBy;
    private String ipAddress;
    private String oldValues;
    private String newValues;
    private LocalDateTime timestamp;
}
