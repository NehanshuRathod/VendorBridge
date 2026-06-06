package com.vendorbridge.vendor.mapper;

import com.vendorbridge.vendor.dto.CreateVendorRequest;
import com.vendorbridge.vendor.dto.UpdateVendorRequest;
import com.vendorbridge.vendor.dto.VendorResponse;
import com.vendorbridge.vendor.entity.Vendor;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VendorMapper {
    VendorResponse toResponse(Vendor vendor);
    Vendor toEntity(CreateVendorRequest request);
    void updateEntity(UpdateVendorRequest request, @MappingTarget Vendor vendor);
    List<VendorResponse> toResponseList(List<Vendor> vendors);
}
