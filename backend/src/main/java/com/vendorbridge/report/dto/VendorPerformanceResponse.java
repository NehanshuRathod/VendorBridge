package com.vendorbridge.report.dto;

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
public class VendorPerformanceResponse {
    private UUID vendorId;
    private String companyName;
    private long rfqsParticipated;
    private long quotationsSubmitted;
    private long quotationsSelected;
    private BigDecimal successRate; // (quotationsSelected / quotationsSubmitted) * 100
    private long purchaseOrdersFulfilled;
    private BigDecimal currentRating;
}
