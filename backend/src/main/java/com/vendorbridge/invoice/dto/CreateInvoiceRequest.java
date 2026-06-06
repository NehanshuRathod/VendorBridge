package com.vendorbridge.invoice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateInvoiceRequest {
    @NotNull(message = "Purchase Order ID is required")
    private UUID purchaseOrderId;

    @NotNull(message = "Invoice Date is required")
    private LocalDate invoiceDate;

    @NotNull(message = "Due Date is required")
    private LocalDate dueDate;
}
