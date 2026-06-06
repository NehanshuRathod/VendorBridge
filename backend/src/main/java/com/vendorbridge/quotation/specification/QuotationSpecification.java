package com.vendorbridge.quotation.specification;

import com.vendorbridge.quotation.entity.Quotation;
import com.vendorbridge.shared.enums.QuotationStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.UUID;

public final class QuotationSpecification {

    private QuotationSpecification() {
        // utility class
    }

    public static Specification<Quotation> hasStatus(QuotationStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public static Specification<Quotation> byVendor(UUID vendorId) {
        return (root, query, criteriaBuilder) -> {
            if (vendorId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("vendor").get("id"), vendorId);
        };
    }

    public static Specification<Quotation> byRfq(UUID rfqId) {
        return (root, query, criteriaBuilder) -> {
            if (rfqId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("rfq").get("id"), rfqId);
        };
    }

    public static Specification<Quotation> submittedAfter(LocalDateTime dateTime) {
        return (root, query, criteriaBuilder) -> {
            if (dateTime == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("submittedAt"), dateTime);
        };
    }
}
