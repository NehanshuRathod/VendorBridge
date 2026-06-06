package com.vendorbridge.rfq.repository;

import com.vendorbridge.rfq.entity.RfqItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RfqItemRepository extends JpaRepository<RfqItem, UUID> {
    List<RfqItem> findByRfqId(UUID rfqId);
}
