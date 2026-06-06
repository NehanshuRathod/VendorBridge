package com.vendorbridge.report.controller;

import com.vendorbridge.auth.security.CustomUserDetails;
import com.vendorbridge.report.dto.DashboardResponse;
import com.vendorbridge.report.dto.ProcurementTrendResponse;
import com.vendorbridge.report.dto.SpendingSummaryResponse;
import com.vendorbridge.report.dto.VendorPerformanceResponse;
import com.vendorbridge.report.service.ReportService;
import com.vendorbridge.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<DashboardResponse> getDashboardMetrics() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ApiResponse.success("Dashboard metrics retrieved", 
                reportService.getDashboardMetrics(userDetails.getUser().getId()));
    }

    @GetMapping("/vendor-performance")
    public ApiResponse<List<VendorPerformanceResponse>> getVendorPerformance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ApiResponse.success("Vendor performance retrieved", 
                reportService.getVendorPerformance(startDate, endDate));
    }

    @GetMapping("/spending-summary")
    public ApiResponse<SpendingSummaryResponse> getSpendingSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ApiResponse.success("Spending summary retrieved", 
                reportService.getSpendingSummary(startDate, endDate));
    }

    @GetMapping("/procurement-trends")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ProcurementTrendResponse> getProcurementTrends(
            @RequestParam(defaultValue = "12") int lastMonths) {
        return ApiResponse.success("Procurement trends retrieved", 
                reportService.getProcurementTrends(lastMonths));
    }

    @GetMapping("/vendor-performance/export")
    public ResponseEntity<byte[]> exportVendorPerformanceToExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        byte[] excelData = reportService.exportVendorPerformanceToExcel(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"vendor_performance.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelData);
    }
}
