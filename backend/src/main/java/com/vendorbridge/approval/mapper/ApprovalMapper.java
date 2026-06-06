package com.vendorbridge.approval.mapper;

import com.vendorbridge.approval.dto.ApprovalResponse;
import com.vendorbridge.approval.dto.CreateApprovalRequest;
import com.vendorbridge.approval.entity.ApprovalRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ApprovalMapper {
    @Mapping(target = "requestedById", source = "requestedBy.id")
    @Mapping(target = "requestedByName", source = "requestedBy.fullName")
    @Mapping(target = "approverId", source = "approver.id")
    @Mapping(target = "approverName", source = "approver.fullName")
    ApprovalResponse toResponse(ApprovalRequest approvalRequest);

    ApprovalRequest toEntity(CreateApprovalRequest request);

    List<ApprovalResponse> toResponseList(List<ApprovalRequest> approvalRequests);
}
