package com.vendorbridge.rfq.specification;

import com.vendorbridge.shared.enums.RfqStatus;
import com.vendorbridge.rfq.entity.Rfq;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class RfqSpecification {
    public static Specification<Rfq> hasStatus(RfqStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Rfq> createdAfter(LocalDateTime after) {
        return (root, query, cb) -> after == null ? null : cb.greaterThanOrEqualTo(root.get("createdAt"), after);
    }

    public static Specification<Rfq> createdBefore(LocalDateTime before) {
        return (root, query, cb) -> before == null ? null : cb.lessThanOrEqualTo(root.get("createdAt"), before);
    }

    public static Specification<Rfq> titleContains(String search) {
        return (root, query, cb) -> search == null || search.trim().isEmpty() ? null :
                cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%");
    }
}
