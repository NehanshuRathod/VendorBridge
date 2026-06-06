package com.vendorbridge.quotation.service;

import com.vendorbridge.quotation.dto.*;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.QuotationStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface QuotationService {

    QuotationResponse createQuotation(CreateQuotationRequest request);

    PagedResponse<QuotationResponse> getQuotations(UUID rfqId, UUID vendorId, QuotationStatus status, Pageable pageable);

    QuotationResponse getQuotationById(UUID id);

    QuotationResponse updateQuotation(UUID id, UpdateQuotationRequest request);

    QuotationResponse submitQuotation(UUID id);

    QuotationComparisonResponse compareQuotations(UUID rfqId);

    QuotationResponse selectQuotation(UUID id);

    QuotationItemResponse addItem(UUID quotationId, QuotationItemRequest request);

    QuotationItemResponse updateItem(UUID quotationId, UUID itemId, QuotationItemRequest request);

    void deleteItem(UUID quotationId, UUID itemId);
}
