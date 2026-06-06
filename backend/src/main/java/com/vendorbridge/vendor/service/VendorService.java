package com.vendorbridge.vendor.service;

import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.VendorCategory;
import com.vendorbridge.shared.enums.VendorStatus;
import com.vendorbridge.vendor.dto.CreateVendorRequest;
import com.vendorbridge.vendor.dto.UpdateVendorRequest;
import com.vendorbridge.vendor.dto.VendorResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface VendorService {
    VendorResponse createVendor(CreateVendorRequest request);
    PagedResponse<VendorResponse> getAllVendors(VendorStatus status, VendorCategory category, String search, Pageable pageable);
    VendorResponse getVendorById(UUID id);
    VendorResponse updateVendor(UUID id, UpdateVendorRequest request);
    void deleteVendor(UUID id);
    VendorResponse updateStatus(UUID id, VendorStatus status);
}
