package com.vendorbridge.rfq.controller;

import com.vendorbridge.rfq.dto.*;
import com.vendorbridge.rfq.service.RfqService;
import com.vendorbridge.shared.dto.ApiResponse;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.RfqStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rfqs")
@RequiredArgsConstructor
public class RfqController {

    private final RfqService rfqService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<RfqResponse> createRfq(@Valid @RequestBody CreateRfqRequest request) {
        return ApiResponse.success("RFQ created successfully", rfqService.createRfq(request));
    }

    @GetMapping
    public ApiResponse<PagedResponse<RfqResponse>> getAllRfqs(
            @RequestParam(required = false) RfqStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdAfter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdBefore,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ApiResponse.success("RFQs retrieved successfully", 
                rfqService.getAllRfqs(status, createdAfter, createdBefore, search, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<RfqResponse> getRfqById(@PathVariable UUID id) {
        return ApiResponse.success("RFQ retrieved successfully", rfqService.getRfqById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<RfqResponse> updateRfq(@PathVariable UUID id, @Valid @RequestBody UpdateRfqRequest request) {
        return ApiResponse.success("RFQ updated successfully", rfqService.updateRfq(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<Void> deleteRfq(@PathVariable UUID id) {
        rfqService.deleteRfq(id);
        return ApiResponse.success("RFQ deleted successfully", null);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<RfqResponse> publishRfq(@PathVariable UUID id) {
        return ApiResponse.success("RFQ published successfully", rfqService.publishRfq(id));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<RfqResponse> closeRfq(@PathVariable UUID id) {
        return ApiResponse.success("RFQ closed successfully", rfqService.closeRfq(id));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<RfqItemResponse> addItem(@PathVariable UUID id, @Valid @RequestBody RfqItemRequest request) {
        return ApiResponse.success("Item added successfully", rfqService.addItem(id, request));
    }

    @PutMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<RfqItemResponse> updateItem(@PathVariable UUID id, @PathVariable UUID itemId, @Valid @RequestBody RfqItemRequest request) {
        return ApiResponse.success("Item updated successfully", rfqService.updateItem(id, itemId, request));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<Void> deleteItem(@PathVariable UUID id, @PathVariable UUID itemId) {
        rfqService.deleteItem(id, itemId);
        return ApiResponse.success("Item deleted successfully", null);
    }

    @PostMapping("/{id}/attachments")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<Void> uploadAttachment(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        rfqService.uploadAttachment(id, file);
        return ApiResponse.success("Attachment uploaded successfully", null);
    }

    @DeleteMapping("/{id}/attachments/{attachmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<Void> deleteAttachment(@PathVariable UUID id, @PathVariable UUID attachmentId) {
        rfqService.deleteAttachment(id, attachmentId);
        return ApiResponse.success("Attachment deleted successfully", null);
    }

    @GetMapping("/{id}/attachments/{attachmentId}/download")
    public ApiResponse<String> downloadAttachment(@PathVariable UUID id, @PathVariable UUID attachmentId) {
        return ApiResponse.success("Presigned URL generated successfully", rfqService.downloadAttachment(id, attachmentId));
    }

    @PostMapping("/{id}/assign-vendors")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<Void> assignVendors(@PathVariable UUID id, @Valid @RequestBody AssignVendorsRequest request) {
        rfqService.assignVendors(id, request);
        return ApiResponse.success("Vendors assigned successfully", null);
    }

    @GetMapping("/{id}/vendors")
    public ApiResponse<List<RfqVendorAssignmentResponse>> getAssignedVendors(@PathVariable UUID id) {
        return ApiResponse.success("Assigned vendors retrieved successfully", rfqService.getAssignedVendors(id));
    }
}
