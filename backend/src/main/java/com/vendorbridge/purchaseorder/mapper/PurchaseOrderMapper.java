package com.vendorbridge.purchaseorder.mapper;

import com.vendorbridge.purchaseorder.dto.CreatePurchaseOrderRequest;
import com.vendorbridge.purchaseorder.dto.PurchaseOrderResponse;
import com.vendorbridge.purchaseorder.entity.PurchaseOrder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PurchaseOrderMapper {
    @Mapping(target = "vendorId", source = "vendor.id")
    @Mapping(target = "vendorName", source = "vendor.companyName")
    @Mapping(target = "quotationId", source = "quotation.id")
    @Mapping(target = "generatedById", source = "generatedBy.id")
    PurchaseOrderResponse toResponse(PurchaseOrder purchaseOrder);

    PurchaseOrder toEntity(CreatePurchaseOrderRequest request);

    List<PurchaseOrderResponse> toResponseList(List<PurchaseOrder> purchaseOrders);
}
