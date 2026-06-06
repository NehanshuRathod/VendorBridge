package com.vendorbridge.rfq.entity;

import com.vendorbridge.shared.entity.BaseEntity;
import com.vendorbridge.vendor.entity.Vendor;
import jakarta.persistence.Entity;
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
@Table(name = "rfq_vendor_assignments")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqVendorAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    private Rfq rfq;

    @ManyToOne(fetch = FetchType.LAZY)
    private Vendor vendor;

    private LocalDateTime invitedAt;
    
    @Builder.Default
    private boolean responded = false;
}
