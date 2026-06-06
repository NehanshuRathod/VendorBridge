package com.vendorbridge.purchaseorder.dto;

import com.vendorbridge.shared.enums.PoStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {

    private UUID id;
    private String poNumber;
    private PoStatus status;

    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private BigDecimal grandTotal;

    private String deliveryAddress;
    private LocalDate expectedDeliveryDate;

    private LocalDate deliveryDate;
    private String paymentTerms;
    private String notes;
    private LocalDateTime sentAt;
    private String pdfFileKey;
    private UUID generatedById;

    private UUID vendorId;
    private String vendorName;

    private UUID rfqId;
    private String rfqNumber;

    private UUID quotationId;
    private String quotationNumber;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
