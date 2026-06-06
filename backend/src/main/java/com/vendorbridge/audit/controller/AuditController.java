package com.vendorbridge.audit.controller;

import com.vendorbridge.audit.dto.AuditLogResponse;
import com.vendorbridge.audit.service.AuditService;
import com.vendorbridge.shared.dto.ApiResponse;
import com.vendorbridge.shared.dto.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ApiResponse<PagedResponse<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) String performedBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            Pageable pageable) {
        return ApiResponse.success("Audit logs retrieved successfully", 
                auditService.getAuditLogs(action, entityName, entityId, performedBy, from, to, pageable));
    }
}
