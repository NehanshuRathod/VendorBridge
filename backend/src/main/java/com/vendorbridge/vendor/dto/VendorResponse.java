package com.vendorbridge.vendor.dto;

import com.vendorbridge.shared.enums.VendorCategory;
import com.vendorbridge.shared.enums.VendorStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class VendorResponse {
    private UUID id;
    private String companyName;
    private String gstNumber;
    private VendorCategory category;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private VendorStatus status;
    private BigDecimal rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
