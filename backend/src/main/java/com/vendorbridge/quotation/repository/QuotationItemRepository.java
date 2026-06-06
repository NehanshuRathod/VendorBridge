package com.vendorbridge.quotation.repository;

import com.vendorbridge.quotation.entity.QuotationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuotationItemRepository extends JpaRepository<QuotationItem, UUID> {

    List<QuotationItem> findByQuotationId(UUID quotationId);
}
