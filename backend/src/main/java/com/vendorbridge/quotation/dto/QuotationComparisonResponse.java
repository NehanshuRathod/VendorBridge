package com.vendorbridge.quotation.dto;

import com.vendorbridge.shared.enums.QuotationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationComparisonResponse {

    private UUID rfqId;
    private String rfqNumber;
    private String rfqTitle;
    private List<QuotationComparisonItem> quotations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuotationComparisonItem {
        private UUID quotationId;
        private UUID vendorId;
        private String vendorName;
        private BigDecimal totalAmount;
        private LocalDate validUntil;
        private QuotationStatus status;
        private List<ItemComparison> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemComparison {
        private UUID rfqItemId;
        private String productName;
        private BigDecimal unitPrice;
        private BigDecimal quantity;
        private BigDecimal totalPrice;
    }
}
