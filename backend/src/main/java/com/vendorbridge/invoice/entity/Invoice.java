package com.vendorbridge.invoice.entity;

import com.vendorbridge.purchaseorder.entity.PurchaseOrder;
import com.vendorbridge.shared.entity.BaseEntity;
import com.vendorbridge.shared.enums.InvoiceStatus;
import com.vendorbridge.user.entity.User;
import com.vendorbridge.vendor.entity.Vendor;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "invoices")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice extends BaseEntity {

    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    private Vendor vendor;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    private LocalDate invoiceDate;
    private LocalDate dueDate;

    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceLineItem> lineItems;

    @ManyToOne(fetch = FetchType.LAZY)
    private User generatedBy;

    private String pdfFileKey;
}
