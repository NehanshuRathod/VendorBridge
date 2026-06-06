package com.vendorbridge.user.controller;

import com.vendorbridge.shared.dto.ApiResponse;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.user.dto.UpdateUserRequest;
import com.vendorbridge.user.dto.UserResponse;
import com.vendorbridge.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ApiResponse<PagedResponse<UserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return ApiResponse.success("Users retrieved successfully", userService.getAllUsers(search, role, active, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable UUID id) {
        return ApiResponse.success("User retrieved successfully", userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest request) {
        return ApiResponse.success("User updated successfully", userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable UUID id, @RequestParam(defaultValue = "false") boolean hardDelete) {
        userService.deleteUser(id, hardDelete);
        return ApiResponse.success("User deleted successfully", null);
    }

    @PatchMapping("/{id}/toggle-active")
    public ApiResponse<UserResponse> toggleActive(@PathVariable UUID id) {
        return ApiResponse.success("User active status toggled successfully", userService.toggleActive(id));
    }
}
