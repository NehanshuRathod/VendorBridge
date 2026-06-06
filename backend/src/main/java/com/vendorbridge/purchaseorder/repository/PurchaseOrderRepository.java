package com.vendorbridge.purchaseorder.repository;

import com.vendorbridge.purchaseorder.entity.PurchaseOrder;
import com.vendorbridge.shared.enums.PoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID>, JpaSpecificationExecutor<PurchaseOrder> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    Page<PurchaseOrder> findByVendorId(UUID vendorId, Pageable pageable);

    Page<PurchaseOrder> findByStatus(PoStatus status, Pageable pageable);

    long countByStatus(PoStatus status);

    @Query("select coalesce(sum(p.totalAmount), 0) from PurchaseOrder p")
    BigDecimal sumTotalAmount();

    List<PurchaseOrder> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    Optional<PurchaseOrder> findByQuotationId(UUID quotationId);
    
    boolean existsByQuotationId(UUID quotationId);
    
    Page<PurchaseOrder> findByVendorIdAndStatus(UUID vendorId, PoStatus status, Pageable pageable);
}
