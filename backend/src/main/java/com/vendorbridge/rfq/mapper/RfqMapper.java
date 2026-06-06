package com.vendorbridge.rfq.mapper;

import com.vendorbridge.rfq.dto.*;
import com.vendorbridge.rfq.entity.Rfq;
import com.vendorbridge.rfq.entity.RfqItem;
import com.vendorbridge.rfq.entity.RfqVendorAssignment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RfqMapper {
    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "itemCount", expression = "java(rfq.getItems() != null ? rfq.getItems().size() : 0)")
    @Mapping(target = "vendorAssignmentCount", expression = "java(rfq.getVendorAssignments() != null ? rfq.getVendorAssignments().size() : 0)")
    RfqResponse toResponse(Rfq rfq);

    Rfq toEntity(CreateRfqRequest request);

    void updateEntity(UpdateRfqRequest request, @MappingTarget Rfq rfq);

    RfqItemResponse toItemResponse(RfqItem item);

    RfqItem toItemEntity(RfqItemRequest request);

    void updateItemEntity(RfqItemRequest request, @MappingTarget RfqItem item);

    @Mapping(target = "vendorId", source = "vendor.id")
    @Mapping(target = "companyName", source = "vendor.companyName")
    RfqVendorAssignmentResponse toAssignmentResponse(RfqVendorAssignment assignment);

    List<RfqResponse> toResponseList(List<Rfq> rfqs);

    List<RfqVendorAssignmentResponse> toAssignmentResponseList(List<RfqVendorAssignment> assignments);
}
