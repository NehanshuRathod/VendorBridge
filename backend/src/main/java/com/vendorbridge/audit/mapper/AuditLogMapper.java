package com.vendorbridge.audit.mapper;

import com.vendorbridge.audit.dto.AuditLogResponse;
import com.vendorbridge.audit.entity.AuditLog;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {
    AuditLogResponse toResponse(AuditLog auditLog);
    List<AuditLogResponse> toResponseList(List<AuditLog> auditLogs);
}
