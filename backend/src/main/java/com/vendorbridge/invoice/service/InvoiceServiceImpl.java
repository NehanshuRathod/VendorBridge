package com.vendorbridge.invoice.service;

import com.vendorbridge.auth.security.CustomUserDetails;
import com.vendorbridge.invoice.dto.CreateInvoiceRequest;
import com.vendorbridge.invoice.dto.InvoiceResponse;
import com.vendorbridge.invoice.dto.InvoiceStatusRequest;
import com.vendorbridge.invoice.entity.Invoice;
import com.vendorbridge.invoice.entity.InvoiceLineItem;
import com.vendorbridge.invoice.mapper.InvoiceMapper;
import com.vendorbridge.invoice.repository.InvoiceRepository;
import com.vendorbridge.purchaseorder.entity.PurchaseOrder;
import com.vendorbridge.purchaseorder.repository.PurchaseOrderRepository;
import com.vendorbridge.quotation.entity.QuotationItem;
import com.vendorbridge.rfq.service.MinioStorageService;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.InvoiceStatus;
import com.vendorbridge.shared.enums.PoStatus;
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
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InvoiceMapper invoiceMapper;
    private final SequenceGenerator sequenceGenerator;
    private final InvoicePdfService pdfService;
    private final MinioStorageService minioStorageService;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public InvoiceResponse createInvoice(CreateInvoiceRequest request) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        PurchaseOrder po = purchaseOrderRepository.findById(request.getPurchaseOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", request.getPurchaseOrderId()));

        if (po.getStatus() != PoStatus.ACKNOWLEDGED && po.getStatus() != PoStatus.DELIVERED) {
            throw new BusinessRuleException("Can only create invoice for ACKNOWLEDGED or DELIVERED PO");
        }

        if (invoiceRepository.existsByPurchaseOrderId(po.getId())) {
            throw new BusinessRuleException("Invoice already exists for this PO");
        }

        Invoice invoice = invoiceMapper.toEntity(request);
        invoice.setInvoiceNumber(sequenceGenerator.generateNumber("INV", "INV"));
        invoice.setPurchaseOrder(po);
        invoice.setVendor(po.getVendor());
        invoice.setStatus(InvoiceStatus.GENERATED);
        invoice.setGeneratedBy(userDetails.getUser());
        
        final Invoice finalInvoice = invoice;
        
        // Map line items from PO Quotation
        List<InvoiceLineItem> lineItems = po.getQuotation().getItems().stream()
                .map(qi -> {
                    InvoiceLineItem item = new InvoiceLineItem();
                    item.setInvoice(finalInvoice);
                    item.setDescription(qi.getRfqItem().getProductName());
                    item.setQuantity(qi.getQuantity());
                    item.setUnitPrice(qi.getUnitPrice());
                    item.setTaxRate(BigDecimal.ZERO); // Default to 0 for simplicity
                    item.setTaxAmount(BigDecimal.ZERO);
                    item.setTotalAmount(qi.getTotalPrice());
                    return item;
                }).collect(Collectors.toList());
                
        invoice.setLineItems(lineItems);
        
        BigDecimal subTotal = lineItems.stream().map(InvoiceLineItem::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        invoice.setSubTotal(subTotal);
        invoice.setTaxAmount(BigDecimal.ZERO);
        invoice.setTotalAmount(subTotal);

        invoice = invoiceRepository.save(invoice);

        // Generate PDF
        byte[] pdfBytes = pdfService.generatePdf(invoice);
        String fileKey = "invoice/" + invoice.getId() + "/" + invoice.getInvoiceNumber() + ".pdf";
        minioStorageService.uploadFile("vendorbridge", fileKey, new ByteArrayInputStream(pdfBytes), "application/pdf");
        
        invoice.setPdfFileKey(fileKey);
        invoice = invoiceRepository.save(invoice);

        return invoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<InvoiceResponse> getAllInvoices(InvoiceStatus status, UUID vendorId, Pageable pageable) {
        Page<Invoice> page;
        if (status != null && vendorId != null) {
            page = invoiceRepository.findByVendorIdAndStatus(vendorId, status, pageable);
        } else if (vendorId != null) {
            page = invoiceRepository.findByVendorId(vendorId, pageable);
        } else if (status != null) {
            page = invoiceRepository.findByStatus(status, pageable);
        } else {
            page = invoiceRepository.findAll(pageable);
        }
        return PagedResponse.from(page.map(invoiceMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(UUID id) {
        Invoice invoice = findInvoiceById(id);
        return invoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse updateStatus(UUID id, InvoiceStatusRequest request) {
        Invoice invoice = findInvoiceById(id);
        invoice.setStatus(request.getStatus());
        invoice = invoiceRepository.save(invoice);
        return invoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public void sendInvoice(UUID id) {
        Invoice invoice = findInvoiceById(id);
        if (invoice.getStatus() != InvoiceStatus.GENERATED) {
            throw new BusinessRuleException("Can only send invoice that is GENERATED");
        }

        invoice.setStatus(InvoiceStatus.SENT);
        invoice = invoiceRepository.save(invoice);

        // Notify vendor or client
        Map<String, Object> event = Map.of(
            "userId", invoice.getPurchaseOrder().getGeneratedBy().getId(), // Send back to PO creator
            "type", "INVOICE_GENERATED",
            "title", "New Invoice Generated",
            "message", "A new invoice " + invoice.getInvoiceNumber() + " has been generated by " + invoice.getVendor().getCompanyName(),
            "recipientEmail", invoice.getPurchaseOrder().getGeneratedBy().getEmail() != null ? invoice.getPurchaseOrder().getGeneratedBy().getEmail() : "",
            "attachmentKey", invoice.getPdfFileKey()
        );
        rabbitTemplate.convertAndSend("vendorbridge.events", "event.notification.invoice", event);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadPdf(UUID id) {
        Invoice invoice = findInvoiceById(id);
        if (invoice.getPdfFileKey() == null) {
            throw new BusinessRuleException("PDF not available for this Invoice");
        }
        try {
            return minioStorageService.downloadFile("vendorbridge", invoice.getPdfFileKey()).readAllBytes();
        } catch (Exception e) {
            throw new BusinessRuleException("Failed to download PDF: " + e.getMessage());
        }
    }

    private Invoice findInvoiceById(UUID id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));
    }
}
