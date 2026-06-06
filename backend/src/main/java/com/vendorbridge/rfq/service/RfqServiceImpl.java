package com.vendorbridge.rfq.service;

import com.vendorbridge.auth.security.CustomUserDetails;
import com.vendorbridge.rfq.dto.*;
import com.vendorbridge.rfq.entity.Rfq;
import com.vendorbridge.rfq.entity.RfqAttachment;
import com.vendorbridge.rfq.entity.RfqItem;
import com.vendorbridge.rfq.entity.RfqVendorAssignment;
import com.vendorbridge.rfq.mapper.RfqMapper;
import com.vendorbridge.rfq.repository.RfqAttachmentRepository;
import com.vendorbridge.rfq.repository.RfqItemRepository;
import com.vendorbridge.rfq.repository.RfqRepository;
import com.vendorbridge.rfq.repository.RfqVendorAssignmentRepository;
import com.vendorbridge.rfq.specification.RfqSpecification;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.RfqStatus;
import com.vendorbridge.shared.exceptions.BusinessRuleException;
import com.vendorbridge.shared.exceptions.ResourceNotFoundException;
import com.vendorbridge.shared.utils.SequenceGenerator;
import com.vendorbridge.vendor.entity.Vendor;
import com.vendorbridge.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RfqServiceImpl implements RfqService {

    private final RfqRepository rfqRepository;
    private final RfqItemRepository rfqItemRepository;
    private final RfqAttachmentRepository rfqAttachmentRepository;
    private final RfqVendorAssignmentRepository rfqVendorAssignmentRepository;
    private final VendorRepository vendorRepository;
    private final RfqMapper rfqMapper;
    private final SequenceGenerator sequenceGenerator;
    private final MinioStorageService minioStorageService;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    @CacheEvict(value = "rfqs", allEntries = true)
    public RfqResponse createRfq(CreateRfqRequest request) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Rfq rfq = rfqMapper.toEntity(request);
        rfq.setRfqNumber(sequenceGenerator.generateNumber("RFQ", "RFQ"));
        rfq.setStatus(RfqStatus.DRAFT);
        rfq.setCreatedBy(userDetails.getUser());
        
        rfq = rfqRepository.save(rfq);
        return rfqMapper.toResponse(rfq);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "rfqs")
    public PagedResponse<RfqResponse> getAllRfqs(RfqStatus status, LocalDateTime createdAfter, LocalDateTime createdBefore, String search, Pageable pageable) {
        Specification<Rfq> spec = Specification.where(RfqSpecification.hasStatus(status))
                .and(RfqSpecification.createdAfter(createdAfter))
                .and(RfqSpecification.createdBefore(createdBefore))
                .and(RfqSpecification.titleContains(search));

        Page<Rfq> page = rfqRepository.findAll(spec, pageable);
        return PagedResponse.from(page.map(rfqMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public RfqResponse getRfqById(UUID id) {
        return rfqMapper.toResponse(findRfqById(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = "rfqs", allEntries = true)
    public RfqResponse updateRfq(UUID id, UpdateRfqRequest request) {
        Rfq rfq = findRfqById(id);
        if (rfq.getStatus() != RfqStatus.DRAFT) {
            throw new BusinessRuleException("Can only update RFQ in DRAFT status");
        }
        
        rfqMapper.updateEntity(request, rfq);
        rfq = rfqRepository.save(rfq);
        return rfqMapper.toResponse(rfq);
    }

    @Override
    @Transactional
    @CacheEvict(value = "rfqs", allEntries = true)
    public void deleteRfq(UUID id) {
        Rfq rfq = findRfqById(id);
        if (rfq.getStatus() != RfqStatus.DRAFT) {
            throw new BusinessRuleException("Can only delete RFQ in DRAFT status");
        }
        rfqRepository.delete(rfq);
    }

    @Override
    @Transactional
    @CacheEvict(value = "rfqs", allEntries = true)
    public RfqResponse publishRfq(UUID id) {
        Rfq rfq = findRfqById(id);
        if (rfq.getStatus() != RfqStatus.DRAFT) {
            throw new BusinessRuleException("Can only publish RFQ in DRAFT status");
        }
        
        rfq.setStatus(RfqStatus.PUBLISHED);
        rfq = rfqRepository.save(rfq);

        // Notify assigned vendors
        List<RfqVendorAssignment> assignments = rfqVendorAssignmentRepository.findByRfqId(id);
        for (RfqVendorAssignment assignment : assignments) {
            Map<String, Object> event = Map.of(
                "userId", assignment.getVendor().getId(), // Mocking as vendorId for now
                "type", "RFQ_PUBLISHED",
                "title", "New RFQ Published",
                "message", "You have been invited to participate in RFQ: " + rfq.getRfqNumber(),
                "recipientEmail", assignment.getVendor().getContactEmail() != null ? assignment.getVendor().getContactEmail() : ""
            );
            rabbitTemplate.convertAndSend("vendorbridge.events", "event.notification.rfq", event);
        }

        return rfqMapper.toResponse(rfq);
    }

    @Override
    @Transactional
    @CacheEvict(value = "rfqs", allEntries = true)
    public RfqResponse closeRfq(UUID id) {
        Rfq rfq = findRfqById(id);
        rfq.setStatus(RfqStatus.CLOSED);
        rfq = rfqRepository.save(rfq);
        return rfqMapper.toResponse(rfq);
    }

    @Override
    @Transactional
    @CacheEvict(value = "rfqs", allEntries = true)
    public RfqItemResponse addItem(UUID rfqId, RfqItemRequest request) {
        Rfq rfq = findRfqById(rfqId);
        if (rfq.getStatus() != RfqStatus.DRAFT) {
            throw new BusinessRuleException("Can only add items to DRAFT RFQ");
        }
        
        RfqItem item = rfqMapper.toItemEntity(request);
        item.setRfq(rfq);
        item = rfqItemRepository.save(item);
        
        if (rfq.getItems() == null) rfq.setItems(new ArrayList<>());
        rfq.getItems().add(item);
        
        return rfqMapper.toItemResponse(item);
    }

    @Override
    @Transactional
    @CacheEvict(value = "rfqs", allEntries = true)
    public RfqItemResponse updateItem(UUID rfqId, UUID itemId, RfqItemRequest request) {
        Rfq rfq = findRfqById(rfqId);
        if (rfq.getStatus() != RfqStatus.DRAFT) {
            throw new BusinessRuleException("Can only update items in DRAFT RFQ");
        }
        
        RfqItem item = rfqItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("RfqItem", "id", itemId));
                
        if (!item.getRfq().getId().equals(rfqId)) {
            throw new BusinessRuleException("Item does not belong to specified RFQ");
        }
        
        rfqMapper.updateItemEntity(request, item);
        item = rfqItemRepository.save(item);
        return rfqMapper.toItemResponse(item);
    }

    @Override
    @Transactional
    @CacheEvict(value = "rfqs", allEntries = true)
    public void deleteItem(UUID rfqId, UUID itemId) {
        Rfq rfq = findRfqById(rfqId);
        if (rfq.getStatus() != RfqStatus.DRAFT) {
            throw new BusinessRuleException("Can only delete items from DRAFT RFQ");
        }
        
        RfqItem item = rfqItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("RfqItem", "id", itemId));
                
        if (!item.getRfq().getId().equals(rfqId)) {
            throw new BusinessRuleException("Item does not belong to specified RFQ");
        }
        
        rfq.getItems().remove(item);
        rfqItemRepository.delete(item);
    }

    @Override
    @Transactional
    @CacheEvict(value = "rfqs", allEntries = true)
    public void uploadAttachment(UUID rfqId, MultipartFile file) {
        Rfq rfq = findRfqById(rfqId);
        
        try {
            String originalFileName = file.getOriginalFilename();
            String fileKey = "rfq/" + rfqId + "/" + UUID.randomUUID() + "_" + originalFileName;
            
            minioStorageService.uploadFile("vendorbridge", fileKey, file.getInputStream(), file.getContentType());
            
            RfqAttachment attachment = RfqAttachment.builder()
                    .rfq(rfq)
                    .fileName(originalFileName)
                    .fileKey(fileKey)
                    .contentType(file.getContentType())
                    .uploadedAt(LocalDateTime.now())
                    .build();
                    
            rfqAttachmentRepository.save(attachment);
        } catch (Exception e) {
            throw new BusinessRuleException("Failed to upload attachment: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "rfqs", allEntries = true)
    public void deleteAttachment(UUID rfqId, UUID attachmentId) {
        RfqAttachment attachment = rfqAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("RfqAttachment", "id", attachmentId));
                
        if (!attachment.getRfq().getId().equals(rfqId)) {
            throw new BusinessRuleException("Attachment does not belong to specified RFQ");
        }
        
        minioStorageService.deleteFile("vendorbridge", attachment.getFileKey());
        rfqAttachmentRepository.delete(attachment);
    }

    @Override
    public String downloadAttachment(UUID rfqId, UUID attachmentId) {
        RfqAttachment attachment = rfqAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("RfqAttachment", "id", attachmentId));
                
        if (!attachment.getRfq().getId().equals(rfqId)) {
            throw new BusinessRuleException("Attachment does not belong to specified RFQ");
        }
        
        return minioStorageService.getPresignedUrl("vendorbridge", attachment.getFileKey(), 1);
    }

    @Override
    @Transactional
    @CacheEvict(value = "rfqs", allEntries = true)
    public void assignVendors(UUID rfqId, AssignVendorsRequest request) {
        Rfq rfq = findRfqById(rfqId);
        
        for (UUID vendorId : request.getVendorIds()) {
            if (!rfqVendorAssignmentRepository.existsByRfqIdAndVendorId(rfqId, vendorId)) {
                Vendor vendor = vendorRepository.findById(vendorId)
                        .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", vendorId));
                        
                RfqVendorAssignment assignment = RfqVendorAssignment.builder()
                        .rfq(rfq)
                        .vendor(vendor)
                        .invitedAt(LocalDateTime.now())
                        .responded(false)
                        .build();
                        
                rfqVendorAssignmentRepository.save(assignment);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<RfqVendorAssignmentResponse> getAssignedVendors(UUID rfqId) {
        return rfqMapper.toAssignmentResponseList(rfqVendorAssignmentRepository.findByRfqId(rfqId));
    }

    private Rfq findRfqById(UUID id) {
        return rfqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rfq", "id", id));
    }
}
