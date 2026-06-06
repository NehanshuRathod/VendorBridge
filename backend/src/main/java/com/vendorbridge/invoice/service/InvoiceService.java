package com.vendorbridge.invoice.service;

import com.vendorbridge.invoice.dto.CreateInvoiceRequest;
import com.vendorbridge.invoice.dto.InvoiceResponse;
import com.vendorbridge.invoice.dto.InvoiceStatusRequest;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.InvoiceStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface InvoiceService {
    InvoiceResponse createInvoice(CreateInvoiceRequest request);
    PagedResponse<InvoiceResponse> getAllInvoices(InvoiceStatus status, UUID vendorId, Pageable pageable);
    InvoiceResponse getInvoiceById(UUID id);
    InvoiceResponse updateStatus(UUID id, InvoiceStatusRequest request);
    void sendInvoice(UUID id);
    byte[] downloadPdf(UUID id);
}
