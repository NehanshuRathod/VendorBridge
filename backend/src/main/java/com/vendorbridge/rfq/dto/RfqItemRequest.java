package com.vendorbridge.rfq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RfqItemRequest {
    @NotBlank(message = "Product name is required")
    private String productName;

    private String description;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    private String unit;

    private BigDecimal estimatedUnitPrice;
}
