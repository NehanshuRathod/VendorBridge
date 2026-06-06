package com.vendorbridge.vendor.dto;

import com.vendorbridge.shared.enums.VendorStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VendorStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private VendorStatus status;
}
