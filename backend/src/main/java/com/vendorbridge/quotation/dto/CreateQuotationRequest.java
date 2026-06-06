package com.vendorbridge.quotation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuotationRequest {

    @NotNull(message = "RFQ ID is required")
    private UUID rfqId;

    private Integer deliveryDays;

    private LocalDate validUntil;

    private String notes;

    @NotEmpty(message = "At least one quotation item is required")
    @Valid
    private List<QuotationItemRequest> items;
}
