package com.vendorbridge.rfq.entity;

import com.vendorbridge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "rfq_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    private Rfq rfq;

    @Column(nullable = false)
    private String productName;

    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal estimatedQuantity;

    private String unit;
}
