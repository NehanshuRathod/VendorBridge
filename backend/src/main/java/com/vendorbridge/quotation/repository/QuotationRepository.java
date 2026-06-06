package com.vendorbridge.quotation.repository;

import com.vendorbridge.quotation.entity.Quotation;
import com.vendorbridge.shared.enums.QuotationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, UUID>, JpaSpecificationExecutor<Quotation> {

    Optional<Quotation> findByQuotationNumber(String quotationNumber);
    boolean existsByRfqIdAndVendorId(UUID rfqId, UUID vendorId);
    List<Quotation> findByRfqIdAndStatusIn(UUID rfqId, List<QuotationStatus> statuses);
    long countByVendorId(UUID vendorId);
    long countByVendorIdAndStatus(UUID vendorId, QuotationStatus status);
}
