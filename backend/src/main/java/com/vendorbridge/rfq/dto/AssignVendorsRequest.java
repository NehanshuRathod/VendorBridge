package com.vendorbridge.rfq.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class AssignVendorsRequest {
    @NotEmpty(message = "Vendor IDs list cannot be empty")
    private List<UUID> vendorIds;
}
