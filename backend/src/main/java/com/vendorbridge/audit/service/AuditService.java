package com.vendorbridge.audit.service;

import com.vendorbridge.audit.dto.AuditLogResponse;
import com.vendorbridge.shared.dto.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface AuditService {
    PagedResponse<AuditLogResponse> getAuditLogs(
            String action, 
            String entityName, 
            String entityId, 
            String performedBy, 
            LocalDateTime from, 
            LocalDateTime to, 
            Pageable pageable);
}
