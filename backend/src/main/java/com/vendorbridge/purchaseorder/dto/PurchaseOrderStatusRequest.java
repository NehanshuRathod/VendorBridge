package com.vendorbridge.purchaseorder.dto;

import com.vendorbridge.shared.enums.PoStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderStatusRequest {

    @NotNull(message = "Status is required")
    private PoStatus status;
}
