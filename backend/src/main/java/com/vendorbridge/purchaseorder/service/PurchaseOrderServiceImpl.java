package com.vendorbridge.purchaseorder.service;

import com.vendorbridge.auth.security.CustomUserDetails;
import com.vendorbridge.purchaseorder.dto.CreatePurchaseOrderRequest;
import com.vendorbridge.purchaseorder.dto.PurchaseOrderResponse;
import com.vendorbridge.purchaseorder.dto.PurchaseOrderStatusRequest;
import com.vendorbridge.purchaseorder.entity.PurchaseOrder;
import com.vendorbridge.purchaseorder.mapper.PurchaseOrderMapper;
import com.vendorbridge.purchaseorder.repository.PurchaseOrderRepository;
import com.vendorbridge.quotation.entity.Quotation;
import com.vendorbridge.quotation.repository.QuotationRepository;
import com.vendorbridge.rfq.service.MinioStorageService;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.PoStatus;
import com.vendorbridge.shared.enums.QuotationStatus;
import com.vendorbridge.shared.exceptions.BusinessRuleException;
import com.vendorbridge.shared.exceptions.ResourceNotFoundException;
import com.vendorbridge.shared.utils.SequenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final QuotationRepository quotationRepository;
    private final PurchaseOrderMapper purchaseOrderMapper;
    private final SequenceGenerator sequenceGenerator;
    private final PurchaseOrderPdfService pdfService;
    private final MinioStorageService minioStorageService;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(CreatePurchaseOrderRequest request) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Quotation quotation = quotationRepository.findById(request.getQuotationId())
                .orElseThrow(() -> new ResourceNotFoundException("Quotation", "id", request.getQuotationId()));

        if (quotation.getStatus() != QuotationStatus.SELECTED) {
            throw new BusinessRuleException("Can only create PO for SELECTED quotation");
        }

        if (purchaseOrderRepository.existsByQuotationId(quotation.getId())) {
            throw new BusinessRuleException("PO already exists for this quotation");
        }

        PurchaseOrder po = purchaseOrderMapper.toEntity(request);
        po.setPoNumber(sequenceGenerator.generateNumber("PO", "PO"));
        po.setVendor(quotation.getVendor());
        po.setQuotation(quotation);
        po.setTotalAmount(quotation.getTotalAmount());
        po.setStatus(PoStatus.GENERATED);
        po.setGeneratedBy(userDetails.getUser());
        
        po = purchaseOrderRepository.save(po);

        // Generate and upload PDF
        byte[] pdfBytes = pdfService.generatePdf(po);
        String fileKey = "po/" + po.getId() + "/" + po.getPoNumber() + ".pdf";
        minioStorageService.uploadFile("vendorbridge", fileKey, new ByteArrayInputStream(pdfBytes), "application/pdf");
        
        po.setPdfFileKey(fileKey);
        po = purchaseOrderRepository.save(po);

        return purchaseOrderMapper.toResponse(po);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PurchaseOrderResponse> getAllPurchaseOrders(PoStatus status, UUID vendorId, Pageable pageable) {
        Page<PurchaseOrder> page;
        if (status != null && vendorId != null) {
            page = purchaseOrderRepository.findByVendorIdAndStatus(vendorId, status, pageable);
        } else if (vendorId != null) {
            page = purchaseOrderRepository.findByVendorId(vendorId, pageable);
        } else if (status != null) {
            page = purchaseOrderRepository.findByStatus(status, pageable);
        } else {
            page = purchaseOrderRepository.findAll(pageable);
        }
        return PagedResponse.from(page.map(purchaseOrderMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderById(UUID id) {
        PurchaseOrder po = findPurchaseOrderById(id);
        return purchaseOrderMapper.toResponse(po);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse updateStatus(UUID id, PurchaseOrderStatusRequest request) {
        PurchaseOrder po = findPurchaseOrderById(id);
        po.setStatus(request.getStatus());
        po = purchaseOrderRepository.save(po);
        return purchaseOrderMapper.toResponse(po);
    }

    @Override
    @Transactional
    public void sendPurchaseOrder(UUID id) {
        PurchaseOrder po = findPurchaseOrderById(id);
        if (po.getStatus() != PoStatus.GENERATED) {
            throw new BusinessRuleException("Can only send PO that is GENERATED");
        }

        po.setStatus(PoStatus.SENT_TO_VENDOR);
        po.setSentAt(LocalDateTime.now());
        po = purchaseOrderRepository.save(po);

        // Notify vendor
        Map<String, Object> event = Map.of(
            "userId", po.getVendor().getId(),
            "type", "PO_GENERATED",
            "title", "New Purchase Order",
            "message", "You have received a new Purchase Order: " + po.getPoNumber(),
            "recipientEmail", po.getVendor().getContactEmail() != null ? po.getVendor().getContactEmail() : "",
            "attachmentKey", po.getPdfFileKey()
        );
        rabbitTemplate.convertAndSend("vendorbridge.events", "event.notification.po", event);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadPdf(UUID id) {
        PurchaseOrder po = findPurchaseOrderById(id);
        if (po.getPdfFileKey() == null) {
            throw new BusinessRuleException("PDF not available for this PO");
        }
        try {
            return minioStorageService.downloadFile("vendorbridge", po.getPdfFileKey()).readAllBytes();
        } catch (Exception e) {
            throw new BusinessRuleException("Failed to download PDF: " + e.getMessage());
        }
    }

    private PurchaseOrder findPurchaseOrderById(UUID id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
    }
}
