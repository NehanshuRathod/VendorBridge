package com.vendorbridge.rfq.repository;

import com.vendorbridge.shared.enums.RfqStatus;
import com.vendorbridge.rfq.entity.Rfq;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RfqRepository extends JpaRepository<Rfq, UUID>, JpaSpecificationExecutor<Rfq> {
    Optional<Rfq> findByRfqNumber(String rfqNumber);
    Page<Rfq> findByStatus(RfqStatus status, Pageable pageable);
    Page<Rfq> findByCreatedById(UUID userId, Pageable pageable);
    long countByStatus(RfqStatus status);
    List<Rfq> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
