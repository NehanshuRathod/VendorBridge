package com.vendorbridge.invoice.dto;

import com.vendorbridge.shared.enums.InvoiceStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class InvoiceResponse {
    private UUID id;
    private String invoiceNumber;
    private UUID purchaseOrderId;
    private String poNumber;
    private UUID vendorId;
    private String vendorName;
    private InvoiceStatus status;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private UUID generatedById;
    private List<InvoiceLineItemResponse> lineItems;
}
