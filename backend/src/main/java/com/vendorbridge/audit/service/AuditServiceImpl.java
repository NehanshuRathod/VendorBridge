package com.vendorbridge.audit.service;

import com.vendorbridge.audit.dto.AuditLogResponse;
import com.vendorbridge.audit.entity.AuditLog;
import com.vendorbridge.audit.mapper.AuditLogMapper;
import com.vendorbridge.audit.repository.AuditLogRepository;
import com.vendorbridge.audit.specification.AuditLogSpecification;
import com.vendorbridge.shared.dto.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> getAuditLogs(
            String action, 
            String entityName, 
            String entityId, 
            String performedBy, 
            LocalDateTime from, 
            LocalDateTime to, 
            Pageable pageable) {
            
        Specification<AuditLog> spec = Specification.where(AuditLogSpecification.hasAction(action))
                .and(AuditLogSpecification.hasEntityName(entityName))
                .and(AuditLogSpecification.hasEntityId(entityId))
                .and(AuditLogSpecification.performedBy(performedBy))
                .and(AuditLogSpecification.createdAfter(from))
                .and(AuditLogSpecification.createdBefore(to));

        Page<AuditLog> page = auditLogRepository.findAll(spec, pageable);
        return PagedResponse.from(page.map(auditLogMapper::toResponse));
    }
}
