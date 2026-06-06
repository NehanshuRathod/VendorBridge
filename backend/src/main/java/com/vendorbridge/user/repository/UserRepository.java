package com.vendorbridge.user.repository;

import com.vendorbridge.shared.enums.Role;
import com.vendorbridge.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByActiveTrue(Pageable pageable);
}
