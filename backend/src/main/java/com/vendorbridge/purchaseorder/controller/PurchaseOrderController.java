package com.vendorbridge.purchaseorder.controller;

import com.vendorbridge.purchaseorder.dto.CreatePurchaseOrderRequest;
import com.vendorbridge.purchaseorder.dto.PurchaseOrderResponse;
import com.vendorbridge.purchaseorder.dto.PurchaseOrderStatusRequest;
import com.vendorbridge.purchaseorder.service.PurchaseOrderService;
import com.vendorbridge.shared.dto.ApiResponse;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.PoStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<PurchaseOrderResponse> createPurchaseOrder(@Valid @RequestBody CreatePurchaseOrderRequest request) {
        return ApiResponse.success("Purchase order created successfully", purchaseOrderService.createPurchaseOrder(request));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PagedResponse<PurchaseOrderResponse>> getAllPurchaseOrders(
            @RequestParam(required = false) PoStatus status,
            @RequestParam(required = false) UUID vendorId,
            Pageable pageable) {
        return ApiResponse.success("Purchase orders retrieved successfully", 
                purchaseOrderService.getAllPurchaseOrders(status, vendorId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PurchaseOrderResponse> getPurchaseOrderById(@PathVariable UUID id) {
        return ApiResponse.success("Purchase order retrieved successfully", purchaseOrderService.getPurchaseOrderById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PurchaseOrderResponse> updateStatus(@PathVariable UUID id, @Valid @RequestBody PurchaseOrderStatusRequest request) {
        return ApiResponse.success("Purchase order status updated successfully", purchaseOrderService.updateStatus(id, request));
    }

    @PostMapping("/{id}/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ApiResponse<Void> sendPurchaseOrder(@PathVariable UUID id) {
        purchaseOrderService.sendPurchaseOrder(id);
        return ApiResponse.success("Purchase order sent successfully", null);
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID id) {
        byte[] pdf = purchaseOrderService.downloadPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"po-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
