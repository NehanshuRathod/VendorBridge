package com.vendorbridge.invoice.entity;

import com.vendorbridge.shared.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "invoice_line_items")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceLineItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    private Invoice invoice;

    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
}
