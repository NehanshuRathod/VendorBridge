package com.vendorbridge.vendor.repository;

import com.vendorbridge.shared.enums.VendorCategory;
import com.vendorbridge.shared.enums.VendorStatus;
import com.vendorbridge.vendor.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VendorRepository extends JpaRepository<Vendor, UUID>, JpaSpecificationExecutor<Vendor> {
    Optional<Vendor> findByGstNumber(String gstNumber);
    boolean existsByGstNumber(String gstNumber);
    List<Vendor> findByStatus(VendorStatus status);
    Page<Vendor> findByCategory(VendorCategory category, Pageable pageable);
}
