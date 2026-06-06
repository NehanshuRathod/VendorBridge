package com.vendorbridge.purchaseorder.service;

import com.vendorbridge.purchaseorder.dto.CreatePurchaseOrderRequest;
import com.vendorbridge.purchaseorder.dto.PurchaseOrderResponse;
import com.vendorbridge.purchaseorder.dto.PurchaseOrderStatusRequest;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.PoStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PurchaseOrderService {
    PurchaseOrderResponse createPurchaseOrder(CreatePurchaseOrderRequest request);
    PagedResponse<PurchaseOrderResponse> getAllPurchaseOrders(PoStatus status, UUID vendorId, Pageable pageable);
    PurchaseOrderResponse getPurchaseOrderById(UUID id);
    PurchaseOrderResponse updateStatus(UUID id, PurchaseOrderStatusRequest request);
    void sendPurchaseOrder(UUID id);
    byte[] downloadPdf(UUID id);
}
