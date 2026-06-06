package com.vendorbridge.quotation.service;

import com.vendorbridge.auth.security.CustomUserDetails;
import com.vendorbridge.quotation.dto.*;
import com.vendorbridge.quotation.entity.Quotation;
import com.vendorbridge.quotation.entity.QuotationItem;
import com.vendorbridge.quotation.mapper.QuotationMapper;
import com.vendorbridge.quotation.repository.QuotationItemRepository;
import com.vendorbridge.quotation.repository.QuotationRepository;
import com.vendorbridge.quotation.specification.QuotationSpecification;
import com.vendorbridge.rfq.entity.Rfq;
import com.vendorbridge.rfq.entity.RfqItem;
import com.vendorbridge.rfq.entity.RfqVendorAssignment;
import com.vendorbridge.rfq.repository.RfqItemRepository;
import com.vendorbridge.rfq.repository.RfqRepository;
import com.vendorbridge.rfq.repository.RfqVendorAssignmentRepository;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.QuotationStatus;
import com.vendorbridge.shared.enums.RfqStatus;
import com.vendorbridge.shared.exceptions.BusinessRuleException;
import com.vendorbridge.shared.exceptions.ResourceNotFoundException;
import com.vendorbridge.vendor.entity.Vendor;
import com.vendorbridge.vendor.entity.VendorUser;
import com.vendorbridge.vendor.repository.VendorUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationServiceImpl implements QuotationService {

    private final QuotationRepository quotationRepository;
    private final QuotationItemRepository quotationItemRepository;
    private final RfqRepository rfqRepository;
    private final RfqItemRepository rfqItemRepository;
    private final RfqVendorAssignmentRepository rfqVendorAssignmentRepository;
    private final VendorUserRepository vendorUserRepository;
    private final QuotationMapper quotationMapper;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public QuotationResponse createQuotation(CreateQuotationRequest request) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        VendorUser vendorUser = vendorUserRepository.findByUserId(userDetails.getUser().getId())
                .orElseThrow(() -> new BusinessRuleException("User is not associated with a vendor"));
        Vendor vendor = vendorUser.getVendor();

        Rfq rfq = rfqRepository.findById(request.getRfqId())
                .orElseThrow(() -> new ResourceNotFoundException("Rfq", "id", request.getRfqId()));

        if (rfq.getStatus() != RfqStatus.PUBLISHED) {
            throw new BusinessRuleException("Can only create quotation for PUBLISHED RFQ");
        }

        if (LocalDate.now().isAfter(rfq.getDeadline())) {
            throw new BusinessRuleException("RFQ deadline has passed");
        }

        RfqVendorAssignment assignment = rfqVendorAssignmentRepository.findByRfqIdAndVendorId(rfq.getId(), vendor.getId())
                .orElseThrow(() -> new BusinessRuleException("Vendor is not assigned to this RFQ"));

        if (quotationRepository.existsByRfqIdAndVendorId(rfq.getId(), vendor.getId())) {
            throw new BusinessRuleException("Quotation already exists for this RFQ from this vendor");
        }

        Quotation quotation = quotationMapper.toEntity(request);
        quotation.setVendor(vendor);
        quotation.setRfq(rfq);
        quotation.setStatus(QuotationStatus.DRAFT);
        quotation.setTotalAmount(BigDecimal.ZERO);
        quotation.setValidUntil(request.getValidUntil());
        quotation.setNotes(request.getNotes());

        quotation = quotationRepository.save(quotation);

        assignment.setResponded(true);
        rfqVendorAssignmentRepository.save(assignment);

        return quotationMapper.toResponse(quotation);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<QuotationResponse> getQuotations(UUID rfqId, UUID vendorId, QuotationStatus status, Pageable pageable) {
        Specification<Quotation> spec = Specification.where(QuotationSpecification.byRfq(rfqId))
                .and(QuotationSpecification.byVendor(vendorId))
                .and(QuotationSpecification.hasStatus(status));

        Page<Quotation> page = quotationRepository.findAll(spec, pageable);
        return PagedResponse.from(page.map(quotationMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public QuotationResponse getQuotationById(UUID id) {
        return quotationMapper.toResponse(findQuotationById(id));
    }

    @Override
    @Transactional
    public QuotationResponse updateQuotation(UUID id, UpdateQuotationRequest request) {
        Quotation quotation = findQuotationById(id);
        
        if (quotation.getStatus() != QuotationStatus.DRAFT) {
            throw new BusinessRuleException("Can only update DRAFT quotation");
        }

        quotation.setValidUntil(request.getValidUntil());
        quotation.setNotes(request.getNotes());
        
        quotation = quotationRepository.save(quotation);
        return quotationMapper.toResponse(quotation);
    }

    @Override
    @Transactional
    public QuotationResponse submitQuotation(UUID id) {
        Quotation quotation = findQuotationById(id);
        
        if (quotation.getStatus() != QuotationStatus.DRAFT) {
            throw new BusinessRuleException("Can only submit DRAFT quotation");
        }

        if (quotation.getItems() == null || quotation.getItems().isEmpty()) {
            throw new BusinessRuleException("Cannot submit empty quotation");
        }

        quotation.setStatus(QuotationStatus.SUBMITTED);
        quotation = quotationRepository.save(quotation);

        // Send notification
        Map<String, Object> event = Map.of(
            "userId", quotation.getRfq().getCreatedBy().getId(),
            "type", "QUOTATION_RECEIVED",
            "title", "New Quotation Received",
            "message", "A new quotation has been submitted by " + quotation.getVendor().getCompanyName() + " for RFQ: " + quotation.getRfq().getRfqNumber(),
            "recipientEmail", quotation.getRfq().getCreatedBy().getEmail() != null ? quotation.getRfq().getCreatedBy().getEmail() : ""
        );
        rabbitTemplate.convertAndSend("vendorbridge.events", "event.notification.quotation", event);

        return quotationMapper.toResponse(quotation);
    }

    @Override
    @Transactional
    public QuotationItemResponse addItem(UUID quotationId, QuotationItemRequest request) {
        Quotation quotation = findQuotationById(quotationId);
        
        if (quotation.getStatus() != QuotationStatus.DRAFT) {
            throw new BusinessRuleException("Can only add items to DRAFT quotation");
        }

        RfqItem rfqItem = rfqItemRepository.findById(request.getRfqItemId())
                .orElseThrow(() -> new ResourceNotFoundException("RfqItem", "id", request.getRfqItemId()));

        if (!rfqItem.getRfq().getId().equals(quotation.getRfq().getId())) {
            throw new BusinessRuleException("RfqItem does not belong to the RFQ of this quotation");
        }

        QuotationItem item = quotationMapper.toItemEntity(request);
        item.setQuotation(quotation);
        item.setRfqItem(rfqItem);
        
        // Calculate item total
        item.setTotalPrice(item.getUnitPrice().multiply(item.getQuantity()));

        item = quotationItemRepository.save(item);

        if (quotation.getItems() == null) {
            quotation.setItems(new ArrayList<>());
        }
        quotation.getItems().add(item);
        
        recalculateTotal(quotation);

        return quotationMapper.toItemResponse(item);
    }

    @Override
    @Transactional
    public QuotationItemResponse updateItem(UUID quotationId, UUID itemId, QuotationItemRequest request) {
        Quotation quotation = findQuotationById(quotationId);
        
        if (quotation.getStatus() != QuotationStatus.DRAFT) {
            throw new BusinessRuleException("Can only update items in DRAFT quotation");
        }

        QuotationItem item = quotationItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("QuotationItem", "id", itemId));

        if (!item.getQuotation().getId().equals(quotationId)) {
            throw new BusinessRuleException("Item does not belong to specified quotation");
        }

        quotationMapper.updateItemEntity(request, item);
        item.setTotalPrice(item.getUnitPrice().multiply(item.getQuantity()));
        
        item = quotationItemRepository.save(item);
        
        recalculateTotal(quotation);

        return quotationMapper.toItemResponse(item);
    }

    @Override
    @Transactional
    public void deleteItem(UUID quotationId, UUID itemId) {
        Quotation quotation = findQuotationById(quotationId);
        
        if (quotation.getStatus() != QuotationStatus.DRAFT) {
            throw new BusinessRuleException("Can only delete items from DRAFT quotation");
        }

        QuotationItem item = quotationItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("QuotationItem", "id", itemId));

        if (!item.getQuotation().getId().equals(quotationId)) {
            throw new BusinessRuleException("Item does not belong to specified quotation");
        }

        quotation.getItems().remove(item);
        quotationItemRepository.delete(item);
        
        recalculateTotal(quotation);
    }

    @Override
    @Transactional(readOnly = true)
    public QuotationComparisonResponse compareQuotations(UUID rfqId) {
        com.vendorbridge.rfq.entity.Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new ResourceNotFoundException("Rfq", "id", rfqId));

        List<Quotation> quotations = quotationRepository.findByRfqIdAndStatusIn(
                rfqId, Arrays.asList(QuotationStatus.SUBMITTED, QuotationStatus.UNDER_REVIEW));
                
        List<QuotationComparisonResponse.QuotationComparisonItem> quotationItems = quotations.stream()
                .map(q -> {
                    QuotationComparisonResponse.QuotationComparisonItem item = new QuotationComparisonResponse.QuotationComparisonItem();
                    item.setQuotationId(q.getId());
                    item.setVendorId(q.getVendor().getId());
                    item.setVendorName(q.getVendor().getCompanyName());
                    item.setTotalAmount(q.getTotalAmount());
                    item.setValidUntil(q.getValidUntil());
                    item.setStatus(q.getStatus());
                    
                    List<QuotationComparisonResponse.ItemComparison> items = q.getItems().stream()
                            .map(qi -> {
                                QuotationComparisonResponse.ItemComparison itemComp = new QuotationComparisonResponse.ItemComparison();
                                itemComp.setRfqItemId(qi.getRfqItem().getId());
                                itemComp.setProductName(qi.getRfqItem().getProductName());
                                itemComp.setUnitPrice(qi.getUnitPrice());
                                itemComp.setQuantity(qi.getQuantity());
                                itemComp.setTotalPrice(qi.getTotalPrice());
                                return itemComp;
                            }).collect(Collectors.toList());
                            
                    item.setItems(items);
                    return item;
                })
                .sorted(Comparator.comparing(QuotationComparisonResponse.QuotationComparisonItem::getTotalAmount))
                .collect(Collectors.toList());

        QuotationComparisonResponse response = new QuotationComparisonResponse();
        response.setRfqId(rfqId);
        response.setRfqNumber(rfq.getRfqNumber());
        response.setRfqTitle(rfq.getTitle());
        response.setQuotations(quotationItems);

        return response;
    }

    @Override
    @Transactional
    public QuotationResponse selectQuotation(UUID id) {
        Quotation quotation = findQuotationById(id);
        
        if (quotation.getStatus() != QuotationStatus.SUBMITTED && quotation.getStatus() != QuotationStatus.UNDER_REVIEW) {
            throw new BusinessRuleException("Can only select SUBMITTED or UNDER_REVIEW quotation");
        }

        // Set this quotation as SELECTED
        quotation.setStatus(QuotationStatus.SELECTED);
        quotation = quotationRepository.save(quotation);
        
        // Set other quotations for this RFQ as REJECTED
        List<Quotation> otherQuotations = quotationRepository.findByRfqIdAndStatusIn(
                quotation.getRfq().getId(), Arrays.asList(QuotationStatus.SUBMITTED, QuotationStatus.UNDER_REVIEW));
                
        for (Quotation other : otherQuotations) {
            if (!other.getId().equals(id)) {
                other.setStatus(QuotationStatus.REJECTED);
                quotationRepository.save(other);
            }
        }
        
        // Update RFQ status
        Rfq rfq = quotation.getRfq();
        rfq.setStatus(RfqStatus.CLOSED);
        rfqRepository.save(rfq);

        return quotationMapper.toResponse(quotation);
    }

    private Quotation findQuotationById(UUID id) {
        return quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation", "id", id));
    }

    private void recalculateTotal(Quotation quotation) {
        BigDecimal total = quotation.getItems().stream()
                .map(QuotationItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        quotation.setTotalAmount(total);
        quotationRepository.save(quotation);
    }
}
