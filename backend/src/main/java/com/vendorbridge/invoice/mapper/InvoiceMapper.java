package com.vendorbridge.invoice.mapper;

import com.vendorbridge.invoice.dto.CreateInvoiceRequest;
import com.vendorbridge.invoice.dto.InvoiceLineItemResponse;
import com.vendorbridge.invoice.dto.InvoiceResponse;
import com.vendorbridge.invoice.entity.Invoice;
import com.vendorbridge.invoice.entity.InvoiceLineItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {
    @Mapping(target = "purchaseOrderId", source = "purchaseOrder.id")
    @Mapping(target = "poNumber", source = "purchaseOrder.poNumber")
    @Mapping(target = "vendorId", source = "vendor.id")
    @Mapping(target = "vendorName", source = "vendor.companyName")
    @Mapping(target = "generatedById", source = "generatedBy.id")
    InvoiceResponse toResponse(Invoice invoice);

    Invoice toEntity(CreateInvoiceRequest request);

    InvoiceLineItemResponse toLineItemResponse(InvoiceLineItem lineItem);

    List<InvoiceResponse> toResponseList(List<Invoice> invoices);
}
