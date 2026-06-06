package com.vendorbridge.purchaseorder.entity;

import com.vendorbridge.quotation.entity.Quotation;
import com.vendorbridge.rfq.entity.Rfq;
import com.vendorbridge.shared.entity.BaseEntity;
import com.vendorbridge.shared.enums.PoStatus;
import com.vendorbridge.user.entity.User;
import com.vendorbridge.vendor.entity.Vendor;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String poNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", nullable = false)
    private Quotation quotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    private Rfq rfq;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PoStatus status = PoStatus.GENERATED;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal taxAmount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal grandTotal;

    @Column(columnDefinition = "TEXT")
    private String deliveryAddress;

    private LocalDate expectedDeliveryDate;

    private LocalDate deliveryDate;

    private String paymentTerms;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime sentAt;

    private String pdfFileKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by_id", nullable = false)
    private User generatedBy;

    @Version
    private Long version;
}
