package com.vendorbridge.audit.entity;

import com.vendorbridge.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog extends BaseEntity {

    private String action;
    private String entityName;
    private String entityId;
    private String performedBy;
    private String ipAddress;
    
    @Column(columnDefinition = "TEXT")
    private String oldValues;
    
    @Column(columnDefinition = "TEXT")
    private String newValues;
    
    private LocalDateTime timestamp;
}
