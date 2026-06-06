package com.vendorbridge.rfq.repository;

import com.vendorbridge.rfq.entity.RfqVendorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RfqVendorAssignmentRepository extends JpaRepository<RfqVendorAssignment, UUID> {
    List<RfqVendorAssignment> findByRfqId(UUID rfqId);
    List<RfqVendorAssignment> findByVendorId(UUID vendorId);
    Optional<RfqVendorAssignment> findByRfqIdAndVendorId(UUID rfqId, UUID vendorId);
    boolean existsByRfqIdAndVendorId(UUID rfqId, UUID vendorId);
}
