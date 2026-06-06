package com.vendorbridge.invoice.repository;

import com.vendorbridge.invoice.entity.InvoiceLineItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InvoiceLineItemRepository extends JpaRepository<InvoiceLineItem, UUID> {
}
