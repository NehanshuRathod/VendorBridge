package com.vendorbridge.quotation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationItemRequest {

    private UUID rfqItemId;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private BigDecimal unitPrice;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    private String notes;
}
