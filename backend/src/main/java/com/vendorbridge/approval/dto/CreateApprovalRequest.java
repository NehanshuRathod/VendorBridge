package com.vendorbridge.approval.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateApprovalRequest {
    @NotBlank(message = "Reference ID is required")
    private String referenceId;

    @NotBlank(message = "Reference type is required")
    private String referenceType;

    @NotNull(message = "Approver ID is required")
    private UUID approverId;

    private String comments;
}
