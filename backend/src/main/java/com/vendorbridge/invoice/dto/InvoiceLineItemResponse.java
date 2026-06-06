package com.vendorbridge.invoice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class InvoiceLineItemResponse {
    private UUID id;
    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
}
