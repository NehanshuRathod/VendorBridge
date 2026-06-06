package com.vendorbridge.invoice.repository;

import com.vendorbridge.invoice.entity.Invoice;
import com.vendorbridge.shared.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    boolean existsByPurchaseOrderId(UUID purchaseOrderId);
    Page<Invoice> findByVendorId(UUID vendorId, Pageable pageable);
    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);
    Page<Invoice> findByVendorIdAndStatus(UUID vendorId, InvoiceStatus status, Pageable pageable);
    long countByStatus(InvoiceStatus status);

    @Query("select coalesce(sum(i.totalAmount), 0) from Invoice i")
    BigDecimal sumTotalAmount();

    List<Invoice> findByInvoiceDateBetween(LocalDate start, LocalDate end);
    List<Invoice> findByStatusIn(List<InvoiceStatus> statuses);
}
