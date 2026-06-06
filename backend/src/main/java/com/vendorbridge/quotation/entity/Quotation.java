package com.vendorbridge.quotation.entity;

import com.vendorbridge.rfq.entity.Rfq;
import com.vendorbridge.shared.entity.BaseEntity;
import com.vendorbridge.shared.enums.QuotationStatus;
import com.vendorbridge.vendor.entity.Vendor;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quotations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quotation extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String quotationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    private Rfq rfq;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    private Integer deliveryDays;

    private LocalDate validUntil;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private QuotationStatus status = QuotationStatus.DRAFT;

    private LocalDateTime submittedAt;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuotationItem> items = new ArrayList<>();
}
