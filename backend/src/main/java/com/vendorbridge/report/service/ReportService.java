package com.vendorbridge.report.service;

import com.vendorbridge.report.dto.DashboardResponse;
import com.vendorbridge.report.dto.ProcurementTrendResponse;
import com.vendorbridge.report.dto.SpendingSummaryResponse;
import com.vendorbridge.report.dto.VendorPerformanceResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReportService {
    DashboardResponse getDashboardMetrics(UUID userId);
    List<VendorPerformanceResponse> getVendorPerformance(LocalDate startDate, LocalDate endDate);
    SpendingSummaryResponse getSpendingSummary(LocalDate startDate, LocalDate endDate);
    ProcurementTrendResponse getProcurementTrends(int lastMonths);
    byte[] exportVendorPerformanceToExcel(LocalDate startDate, LocalDate endDate);
}
