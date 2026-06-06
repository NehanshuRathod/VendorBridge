package com.vendorbridge.vendor.controller;

import com.vendorbridge.shared.dto.ApiResponse;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.VendorCategory;
import com.vendorbridge.shared.enums.VendorStatus;
import com.vendorbridge.vendor.dto.CreateVendorRequest;
import com.vendorbridge.vendor.dto.UpdateVendorRequest;
import com.vendorbridge.vendor.dto.VendorResponse;
import com.vendorbridge.vendor.dto.VendorStatusUpdateRequest;
import com.vendorbridge.vendor.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<VendorResponse> createVendor(@Valid @RequestBody CreateVendorRequest request) {
        return ApiResponse.success("Vendor created successfully", vendorService.createVendor(request));
    }

    @GetMapping
    public ApiResponse<PagedResponse<VendorResponse>> getAllVendors(
            @RequestParam(required = false) VendorStatus status,
            @RequestParam(required = false) VendorCategory category,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ApiResponse.success("Vendors retrieved successfully", vendorService.getAllVendors(status, category, search, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<VendorResponse> getVendorById(@PathVariable UUID id) {
        return ApiResponse.success("Vendor retrieved successfully", vendorService.getVendorById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<VendorResponse> updateVendor(@PathVariable UUID id, @Valid @RequestBody UpdateVendorRequest request) {
        return ApiResponse.success("Vendor updated successfully", vendorService.updateVendor(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteVendor(@PathVariable UUID id) {
        vendorService.deleteVendor(id);
        return ApiResponse.success("Vendor deleted successfully", null);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<VendorResponse> updateStatus(@PathVariable UUID id, @Valid @RequestBody VendorStatusUpdateRequest request) {
        return ApiResponse.success("Vendor status updated successfully", vendorService.updateStatus(id, request.getStatus()));
    }
}
