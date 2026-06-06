package com.vendorbridge.approval.entity;

import com.vendorbridge.shared.entity.BaseEntity;
import com.vendorbridge.shared.enums.ApprovalStatus;
import com.vendorbridge.user.entity.User;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "approval_requests")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest extends BaseEntity {

    private String referenceId;
    private String referenceType;

    @ManyToOne(fetch = FetchType.LAZY)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    private User approver;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus status;

    private String comments;

    private LocalDateTime processedAt;
}
