package com.vendorbridge.quotation.controller;

import com.vendorbridge.quotation.dto.*;
import com.vendorbridge.quotation.service.QuotationService;
import com.vendorbridge.shared.dto.ApiResponse;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.QuotationStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quotations")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService quotationService;

    @PostMapping
    @PreAuthorize("hasRole('VENDOR_USER')")
    public ApiResponse<QuotationResponse> createQuotation(@Valid @RequestBody CreateQuotationRequest request) {
        return ApiResponse.success("Quotation created successfully", quotationService.createQuotation(request));
    }

    @GetMapping
    public ApiResponse<PagedResponse<QuotationResponse>> getQuotations(
            @RequestParam(required = false) UUID rfqId,
            @RequestParam(required = false) UUID vendorId,
            @RequestParam(required = false) QuotationStatus status,
            Pageable pageable) {
        return ApiResponse.success("Quotations retrieved successfully", 
                quotationService.getQuotations(rfqId, vendorId, status, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<QuotationResponse> getQuotationById(@PathVariable UUID id) {
        return ApiResponse.success("Quotation retrieved successfully", quotationService.getQuotationById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR_USER')")
    public ApiResponse<QuotationResponse> updateQuotation(@PathVariable UUID id, @Valid @RequestBody UpdateQuotationRequest request) {
        return ApiResponse.success("Quotation updated successfully", quotationService.updateQuotation(id, request));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('VENDOR_USER')")
    public ApiResponse<QuotationResponse> submitQuotation(@PathVariable UUID id) {
        return ApiResponse.success("Quotation submitted successfully", quotationService.submitQuotation(id));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasRole('VENDOR_USER')")
    public ApiResponse<QuotationItemResponse> addItem(@PathVariable UUID id, @Valid @RequestBody QuotationItemRequest request) {
        return ApiResponse.success("Item added successfully", quotationService.addItem(id, request));
    }

    @PutMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasRole('VENDOR_USER')")
    public ApiResponse<QuotationItemResponse> updateItem(@PathVariable UUID id, @PathVariable UUID itemId, @Valid @RequestBody QuotationItemRequest request) {
        return ApiResponse.success("Item updated successfully", quotationService.updateItem(id, itemId, request));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasRole('VENDOR_USER')")
    public ApiResponse<Void> deleteItem(@PathVariable UUID id, @PathVariable UUID itemId) {
        quotationService.deleteItem(id, itemId);
        return ApiResponse.success("Item deleted successfully", null);
    }

    @GetMapping("/rfq/{rfqId}/compare")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER')")
    public ApiResponse<QuotationComparisonResponse> compareQuotations(@PathVariable UUID rfqId) {
        return ApiResponse.success("Quotations compared successfully", quotationService.compareQuotations(rfqId));
    }

    @PostMapping("/{id}/select")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER')")
    public ApiResponse<QuotationResponse> selectQuotation(@PathVariable UUID id) {
        return ApiResponse.success("Quotation selected successfully", quotationService.selectQuotation(id));
    }
}
