package com.vendorbridge.vendor.repository;

import com.vendorbridge.vendor.entity.VendorUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VendorUserRepository extends JpaRepository<VendorUser, UUID> {
    Optional<VendorUser> findByUserId(UUID userId);
    Optional<VendorUser> findByUser_Email(String email);
    List<VendorUser> findByVendorId(UUID vendorId);
}
