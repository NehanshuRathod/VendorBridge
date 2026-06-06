package com.vendorbridge.audit.specification;

import com.vendorbridge.audit.entity.AuditLog;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class AuditLogSpecification {
    public static Specification<AuditLog> hasAction(String action) {
        return (root, query, cb) -> action == null || action.trim().isEmpty() ? null : cb.equal(root.get("action"), action);
    }

    public static Specification<AuditLog> hasEntityName(String entityName) {
        return (root, query, cb) -> entityName == null || entityName.trim().isEmpty() ? null : cb.equal(root.get("entityName"), entityName);
    }

    public static Specification<AuditLog> hasEntityId(String entityId) {
        return (root, query, cb) -> entityId == null || entityId.trim().isEmpty() ? null : cb.equal(root.get("entityId"), entityId);
    }

    public static Specification<AuditLog> performedBy(String performedBy) {
        return (root, query, cb) -> performedBy == null || performedBy.trim().isEmpty() ? null : cb.equal(root.get("performedBy"), performedBy);
    }

    public static Specification<AuditLog> createdAfter(LocalDateTime after) {
        return (root, query, cb) -> after == null ? null : cb.greaterThanOrEqualTo(root.get("timestamp"), after);
    }

    public static Specification<AuditLog> createdBefore(LocalDateTime before) {
        return (root, query, cb) -> before == null ? null : cb.lessThanOrEqualTo(root.get("timestamp"), before);
    }
}
