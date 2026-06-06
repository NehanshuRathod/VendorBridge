package com.vendorbridge.purchaseorder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseOrderRequest {

    @NotNull(message = "Quotation ID is required")
    private java.util.UUID quotationId;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    @NotNull(message = "Expected delivery date is required")
    private LocalDate expectedDeliveryDate;

    @Builder.Default
    private BigDecimal taxRate = new BigDecimal("18");
}
