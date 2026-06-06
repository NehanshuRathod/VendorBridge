package com.vendorbridge.report.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class InvoiceSummary {
    private long totalCount;
    private long generatedCount;
    private long sentCount;
    private long paidCount;
    private long overdueCount;
    private BigDecimal totalValue;
    private BigDecimal pendingValue;
}
