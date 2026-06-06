package com.vendorbridge.shared.utils;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SequenceTrackerRepository extends JpaRepository<SequenceTracker, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<SequenceTracker> findBySequenceType(String sequenceType);
}
