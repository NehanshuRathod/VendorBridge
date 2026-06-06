package com.vendorbridge.quotation.dto;

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
public class QuotationItemResponse {

    private UUID id;
    private UUID rfqItemId;
    private String productName;
    private BigDecimal unitPrice;
    private BigDecimal quantity;
    private BigDecimal totalPrice;
    private String notes;
}
