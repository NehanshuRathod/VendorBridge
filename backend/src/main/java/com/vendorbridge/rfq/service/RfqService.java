package com.vendorbridge.rfq.service;

import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.RfqStatus;
import com.vendorbridge.rfq.dto.*;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RfqService {
    RfqResponse createRfq(CreateRfqRequest request);
    PagedResponse<RfqResponse> getAllRfqs(RfqStatus status, LocalDateTime createdAfter, LocalDateTime createdBefore, String search, Pageable pageable);
    RfqResponse getRfqById(UUID id);
    RfqResponse updateRfq(UUID id, UpdateRfqRequest request);
    void deleteRfq(UUID id);
    RfqResponse publishRfq(UUID id);
    RfqResponse closeRfq(UUID id);
    
    RfqItemResponse addItem(UUID rfqId, RfqItemRequest request);
    RfqItemResponse updateItem(UUID rfqId, UUID itemId, RfqItemRequest request);
    void deleteItem(UUID rfqId, UUID itemId);
    
    void uploadAttachment(UUID rfqId, MultipartFile file);
    void deleteAttachment(UUID rfqId, UUID attachmentId);
    String downloadAttachment(UUID rfqId, UUID attachmentId);
    
    void assignVendors(UUID rfqId, AssignVendorsRequest request);
    List<RfqVendorAssignmentResponse> getAssignedVendors(UUID rfqId);
}
