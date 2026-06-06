package com.vendorbridge.approval.dto;

import com.vendorbridge.shared.enums.ApprovalStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ApprovalResponse {
    private UUID id;
    private String referenceId;
    private String referenceType;
    private UUID requestedById;
    private String requestedByName;
    private UUID approverId;
    private String approverName;
    private ApprovalStatus status;
    private String comments;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
}
