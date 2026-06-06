package com.vendorbridge.vendor.entity;

import com.vendorbridge.shared.entity.BaseEntity;
import com.vendorbridge.shared.enums.VendorCategory;
import com.vendorbridge.shared.enums.VendorStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "vendors")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vendor extends BaseEntity {

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "gst_number", unique = true)
    private String gstNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VendorCategory category = VendorCategory.GOODS;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VendorStatus status = VendorStatus.PENDING_APPROVAL;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;
}
