package com.vendorbridge.report.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PurchaseOrderSummary {
    private long totalCount;
    private long generatedCount;
    private long acknowledgedCount;
    private long completedCount;
    private BigDecimal totalValue;
}
