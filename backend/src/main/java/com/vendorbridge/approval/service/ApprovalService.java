package com.vendorbridge.approval.service;

import com.vendorbridge.approval.dto.ApprovalDecisionRequest;
import com.vendorbridge.approval.dto.ApprovalResponse;
import com.vendorbridge.approval.dto.CreateApprovalRequest;
import com.vendorbridge.shared.dto.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ApprovalService {
    ApprovalResponse createApprovalRequest(CreateApprovalRequest request);
    PagedResponse<ApprovalResponse> getApprovalsForMe(Pageable pageable);
    PagedResponse<ApprovalResponse> getApprovalsByMe(Pageable pageable);
    ApprovalResponse getApprovalById(UUID id);
    ApprovalResponse processApproval(UUID id, ApprovalDecisionRequest request);
}
