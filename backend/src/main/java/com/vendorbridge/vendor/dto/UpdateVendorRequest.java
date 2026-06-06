package com.vendorbridge.vendor.dto;

import com.vendorbridge.shared.enums.VendorCategory;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateVendorRequest {
    @NotBlank(message = "Company name is required")
    private String companyName;

    private String gstNumber;

    @NotNull(message = "Category is required")
    private VendorCategory category;

    private String contactName;

    @Email(message = "Invalid email format")
    private String contactEmail;

    private String contactPhone;

    private String address;
}
