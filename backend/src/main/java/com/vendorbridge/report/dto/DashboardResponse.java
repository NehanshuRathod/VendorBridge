package com.vendorbridge.report.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardResponse {
    private long totalVendors;
    private long activeRfqs;
    private long pendingApprovals;
    private long unreadNotifications;
    private PurchaseOrderSummary poSummary;
    private InvoiceSummary invoiceSummary;
}
