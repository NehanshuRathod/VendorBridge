package com.vendorbridge.approval.service;

import com.vendorbridge.approval.dto.ApprovalDecisionRequest;
import com.vendorbridge.approval.dto.ApprovalResponse;
import com.vendorbridge.approval.dto.CreateApprovalRequest;
import com.vendorbridge.approval.entity.ApprovalRequest;
import com.vendorbridge.approval.mapper.ApprovalMapper;
import com.vendorbridge.approval.repository.ApprovalRequestRepository;
import com.vendorbridge.auth.security.CustomUserDetails;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.ApprovalStatus;
import com.vendorbridge.shared.exceptions.BusinessRuleException;
import com.vendorbridge.shared.exceptions.ResourceNotFoundException;
import com.vendorbridge.user.entity.User;
import com.vendorbridge.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApprovalServiceImpl implements ApprovalService {

    private final ApprovalRequestRepository approvalRequestRepository;
    private final UserRepository userRepository;
    private final ApprovalMapper approvalMapper;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public ApprovalResponse createApprovalRequest(CreateApprovalRequest request) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User requestedBy = userDetails.getUser();

        User approver = userRepository.findById(request.getApproverId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getApproverId()));

        ApprovalRequest approvalRequest = approvalMapper.toEntity(request);
        approvalRequest.setRequestedBy(requestedBy);
        approvalRequest.setApprover(approver);
        approvalRequest.setStatus(ApprovalStatus.PENDING);

        approvalRequest = approvalRequestRepository.save(approvalRequest);

        // Notify approver
        Map<String, Object> event = Map.of(
            "userId", approver.getId(),
            "type", "APPROVAL_REQUIRED",
            "title", "Approval Required",
            "message", "You have a new approval request for " + request.getReferenceType() + " " + request.getReferenceId(),
            "recipientEmail", approver.getEmail() != null ? approver.getEmail() : ""
        );
        rabbitTemplate.convertAndSend("vendorbridge.events", "event.notification.approval", event);

        return approvalMapper.toResponse(approvalRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ApprovalResponse> getApprovalsForMe(Pageable pageable) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Page<ApprovalRequest> page = approvalRequestRepository.findByApproverIdAndStatus(userDetails.getUser().getId(), ApprovalStatus.PENDING, pageable);
        return PagedResponse.from(page.map(approvalMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ApprovalResponse> getApprovalsByMe(Pageable pageable) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Page<ApprovalRequest> page = approvalRequestRepository.findByRequestedById(userDetails.getUser().getId(), pageable);
        return PagedResponse.from(page.map(approvalMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ApprovalResponse getApprovalById(UUID id) {
        ApprovalRequest approvalRequest = approvalRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ApprovalRequest", "id", id));
        return approvalMapper.toResponse(approvalRequest);
    }

    @Override
    @Transactional
    public ApprovalResponse processApproval(UUID id, ApprovalDecisionRequest request) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        ApprovalRequest approvalRequest = approvalRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ApprovalRequest", "id", id));

        if (!approvalRequest.getApprover().getId().equals(userDetails.getUser().getId())) {
            throw new BusinessRuleException("You are not authorized to process this approval request");
        }

        if (approvalRequest.getStatus() != ApprovalStatus.PENDING) {
            throw new BusinessRuleException("Approval request has already been processed");
        }

        if (request.getStatus() == ApprovalStatus.PENDING) {
            throw new BusinessRuleException("Cannot set status to PENDING");
        }

        approvalRequest.setStatus(request.getStatus());
        approvalRequest.setComments(request.getComments());
        approvalRequest.setProcessedAt(LocalDateTime.now());

        approvalRequest = approvalRequestRepository.save(approvalRequest);

        // Notify requester
        Map<String, Object> event = Map.of(
            "userId", approvalRequest.getRequestedBy().getId(),
            "type", "APPROVAL_REQUIRED", // Just a notification
            "title", "Approval " + request.getStatus().name(),
            "message", "Your approval request for " + approvalRequest.getReferenceType() + " " + approvalRequest.getReferenceId() + " has been " + request.getStatus().name(),
            "recipientEmail", approvalRequest.getRequestedBy().getEmail() != null ? approvalRequest.getRequestedBy().getEmail() : ""
        );
        rabbitTemplate.convertAndSend("vendorbridge.events", "event.notification.approval", event);

        return approvalMapper.toResponse(approvalRequest);
    }
}
