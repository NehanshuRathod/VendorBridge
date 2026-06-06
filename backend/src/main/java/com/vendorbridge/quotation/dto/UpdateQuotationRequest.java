package com.vendorbridge.quotation.dto;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateQuotationRequest {

    private Integer deliveryDays;

    private LocalDate validUntil;

    private String notes;

    @Valid
    private List<QuotationItemRequest> items;
}
