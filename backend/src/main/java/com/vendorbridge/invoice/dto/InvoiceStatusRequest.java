package com.vendorbridge.invoice.dto;

import com.vendorbridge.shared.enums.InvoiceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InvoiceStatusRequest {
    @NotNull(message = "Status is required")
    private InvoiceStatus status;
}
