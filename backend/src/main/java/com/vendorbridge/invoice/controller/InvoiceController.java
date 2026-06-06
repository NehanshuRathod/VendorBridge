package com.vendorbridge.invoice.controller;

import com.vendorbridge.invoice.dto.CreateInvoiceRequest;
import com.vendorbridge.invoice.dto.InvoiceResponse;
import com.vendorbridge.invoice.dto.InvoiceStatusRequest;
import com.vendorbridge.invoice.service.InvoiceService;
import com.vendorbridge.shared.dto.ApiResponse;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.InvoiceStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    @PreAuthorize("hasRole('VENDOR_USER')")
    public ApiResponse<InvoiceResponse> createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        return ApiResponse.success("Invoice created successfully", invoiceService.createInvoice(request));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PagedResponse<InvoiceResponse>> getAllInvoices(
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) UUID vendorId,
            Pageable pageable) {
        return ApiResponse.success("Invoices retrieved successfully", 
                invoiceService.getAllInvoices(status, vendorId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<InvoiceResponse> getInvoiceById(@PathVariable UUID id) {
        return ApiResponse.success("Invoice retrieved successfully", invoiceService.getInvoiceById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER')")
    public ApiResponse<InvoiceResponse> updateStatus(@PathVariable UUID id, @Valid @RequestBody InvoiceStatusRequest request) {
        return ApiResponse.success("Invoice status updated successfully", invoiceService.updateStatus(id, request));
    }

    @PostMapping("/{id}/send")
    @PreAuthorize("hasRole('VENDOR_USER')")
    public ApiResponse<Void> sendInvoice(@PathVariable UUID id) {
        invoiceService.sendInvoice(id);
        return ApiResponse.success("Invoice sent successfully", null);
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID id) {
        byte[] pdf = invoiceService.downloadPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"invoice-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
