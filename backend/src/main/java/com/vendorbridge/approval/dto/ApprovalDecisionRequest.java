package com.vendorbridge.approval.dto;

import com.vendorbridge.shared.enums.ApprovalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApprovalDecisionRequest {
    @NotNull(message = "Status is required")
    private ApprovalStatus status;

    private String comments;
}
