package com.vendorbridge.approval.repository;

import com.vendorbridge.approval.entity.ApprovalRequest;
import com.vendorbridge.shared.enums.ApprovalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, UUID> {
    Page<ApprovalRequest> findByApproverIdAndStatus(UUID approverId, ApprovalStatus status, Pageable pageable);
    Page<ApprovalRequest> findByRequestedById(UUID requestedById, Pageable pageable);
    long countByApproverIdAndStatus(UUID approverId, ApprovalStatus status);
}
