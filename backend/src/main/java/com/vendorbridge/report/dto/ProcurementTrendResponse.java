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
public class ProcurementTrendResponse {
    private Map<String, Long> rfqsByMonth;
    private Map<String, Long> posByMonth;
    private Map<String, BigDecimal> spendByMonth;
    private BigDecimal averageRfqToPoDays;
}
