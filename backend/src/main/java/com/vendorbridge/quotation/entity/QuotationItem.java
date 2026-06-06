package com.vendorbridge.quotation.entity;

import com.vendorbridge.rfq.entity.RfqItem;
import com.vendorbridge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "quotation_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", nullable = false)
    private Quotation quotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_item_id")
    private RfqItem rfqItem;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(nullable = false)
    private BigDecimal totalPrice;
}
