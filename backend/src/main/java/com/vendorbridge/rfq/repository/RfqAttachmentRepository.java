package com.vendorbridge.rfq.repository;

import com.vendorbridge.rfq.entity.RfqAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RfqAttachmentRepository extends JpaRepository<RfqAttachment, UUID> {
    List<RfqAttachment> findByRfqId(UUID rfqId);
}
