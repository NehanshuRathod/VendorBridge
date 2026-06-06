package com.vendorbridge.quotation.mapper;

import com.vendorbridge.quotation.dto.CreateQuotationRequest;
import com.vendorbridge.quotation.dto.QuotationItemRequest;
import com.vendorbridge.quotation.dto.QuotationItemResponse;
import com.vendorbridge.quotation.dto.QuotationResponse;
import com.vendorbridge.quotation.dto.UpdateQuotationRequest;
import com.vendorbridge.quotation.entity.Quotation;
import com.vendorbridge.quotation.entity.QuotationItem;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuotationMapper {

    @Mapping(source = "vendor.companyName", target = "vendorName")
    @Mapping(source = "vendor.id", target = "vendorId")
    @Mapping(source = "rfq.rfqNumber", target = "rfqNumber")
    @Mapping(source = "rfq.id", target = "rfqId")
    @Mapping(source = "items", target = "items")
    QuotationResponse toResponse(Quotation quotation);

    @Mapping(source = "rfqItem.id", target = "rfqItemId")
    @Mapping(source = "rfqItem.productName", target = "productName")
    QuotationItemResponse toItemResponse(QuotationItem item);

    List<QuotationResponse> toResponseList(List<Quotation> quotations);

    List<QuotationItemResponse> toItemResponseList(List<QuotationItem> items);

    @Mapping(target = "quotationNumber", ignore = true)
    @Mapping(target = "rfq", ignore = true)
    @Mapping(target = "vendor", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "items", ignore = true)
    Quotation toEntity(CreateQuotationRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "quotationNumber", ignore = true)
    @Mapping(target = "rfq", ignore = true)
    @Mapping(target = "vendor", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "items", ignore = true)
    void updateEntity(UpdateQuotationRequest request, @MappingTarget Quotation quotation);

    @Mapping(target = "quotation", ignore = true)
    @Mapping(target = "rfqItem", ignore = true)
    @Mapping(target = "totalPrice", ignore = true)
    QuotationItem toItemEntity(QuotationItemRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "quotation", ignore = true)
    @Mapping(target = "rfqItem", ignore = true)
    @Mapping(target = "totalPrice", ignore = true)
    void updateItemEntity(QuotationItemRequest request, @MappingTarget QuotationItem item);
}
