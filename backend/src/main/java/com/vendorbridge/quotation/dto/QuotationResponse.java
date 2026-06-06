package com.vendorbridge.quotation.dto;

import com.vendorbridge.shared.enums.QuotationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationResponse {

    private UUID id;
    private String quotationNumber;
    private UUID rfqId;
    private String rfqNumber;
    private UUID vendorId;
    private String vendorName;
    private QuotationStatus status;
    private BigDecimal totalAmount;
    private Integer deliveryDays;
    private LocalDate validUntil;
    private String notes;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<QuotationItemResponse> items;
}
