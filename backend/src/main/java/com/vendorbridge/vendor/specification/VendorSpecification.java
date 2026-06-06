package com.vendorbridge.vendor.specification;

import com.vendorbridge.shared.enums.VendorCategory;
import com.vendorbridge.shared.enums.VendorStatus;
import com.vendorbridge.vendor.entity.Vendor;
import org.springframework.data.jpa.domain.Specification;

public class VendorSpecification {
    public static Specification<Vendor> hasStatus(VendorStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Vendor> hasCategory(VendorCategory category) {
        return (root, query, cb) -> category == null ? null : cb.equal(root.get("category"), category);
    }

    public static Specification<Vendor> companyNameContains(String search) {
        return (root, query, cb) -> search == null || search.trim().isEmpty() ? null :
                cb.like(cb.lower(root.get("companyName")), "%" + search.toLowerCase() + "%");
    }
}
