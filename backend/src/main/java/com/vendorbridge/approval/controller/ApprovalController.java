package com.vendorbridge.approval.controller;

import com.vendorbridge.approval.dto.ApprovalDecisionRequest;
import com.vendorbridge.approval.dto.ApprovalResponse;
import com.vendorbridge.approval.dto.CreateApprovalRequest;
import com.vendorbridge.approval.service.ApprovalService;
import com.vendorbridge.shared.dto.ApiResponse;
import com.vendorbridge.shared.dto.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ApprovalResponse> createApprovalRequest(@Valid @RequestBody CreateApprovalRequest request) {
        return ApiResponse.success("Approval request created successfully", approvalService.createApprovalRequest(request));
    }

    @GetMapping("/for-me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PagedResponse<ApprovalResponse>> getApprovalsForMe(Pageable pageable) {
        return ApiResponse.success("Approvals retrieved successfully", approvalService.getApprovalsForMe(pageable));
    }

    @GetMapping("/by-me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PagedResponse<ApprovalResponse>> getApprovalsByMe(Pageable pageable) {
        return ApiResponse.success("Approvals retrieved successfully", approvalService.getApprovalsByMe(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ApprovalResponse> getApprovalById(@PathVariable UUID id) {
        return ApiResponse.success("Approval retrieved successfully", approvalService.getApprovalById(id));
    }

    @PostMapping("/{id}/process")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ApprovalResponse> processApproval(@PathVariable UUID id, @Valid @RequestBody ApprovalDecisionRequest request) {
        return ApiResponse.success("Approval processed successfully", approvalService.processApproval(id, request));
    }
}
