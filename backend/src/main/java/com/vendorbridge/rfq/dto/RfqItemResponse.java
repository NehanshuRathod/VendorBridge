package com.vendorbridge.rfq.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class RfqItemResponse {
    private UUID id;
    private String productName;
    private String description;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal estimatedUnitPrice;
}
