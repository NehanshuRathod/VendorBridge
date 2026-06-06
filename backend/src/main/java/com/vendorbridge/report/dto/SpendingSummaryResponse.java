package com.vendorbridge.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendingSummaryResponse {
    private BigDecimal totalSpend;
    private Map<String, BigDecimal> spendByCategory;
    private Map<String, BigDecimal> spendByVendor;
    private Map<String, BigDecimal> spendByMonth;
}
