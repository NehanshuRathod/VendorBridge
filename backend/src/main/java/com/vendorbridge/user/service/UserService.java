package com.vendorbridge.user.service;

import com.vendorbridge.user.dto.UpdateUserRequest;
import com.vendorbridge.user.dto.UserResponse;
import org.springframework.data.domain.Pageable;
import com.vendorbridge.shared.dto.PagedResponse;

import java.util.UUID;

public interface UserService {

    PagedResponse<UserResponse> getAllUsers(String search, String role, Boolean active, Pageable pageable);

    UserResponse getUserById(UUID id);

    UserResponse updateUser(UUID id, UpdateUserRequest request);

    void deleteUser(UUID id, boolean hardDelete);

    UserResponse toggleActive(UUID id);
}
