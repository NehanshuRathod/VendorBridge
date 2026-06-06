package com.vendorbridge.auth.controller;

import com.vendorbridge.auth.dto.*;
import com.vendorbridge.auth.service.AuthService;
import com.vendorbridge.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN') or #request.role == null or #request.role == T(com.vendorbridge.shared.enums.Role).VENDOR_USER or #request.role == T(com.vendorbridge.shared.enums.Role).PROCUREMENT_OFFICER or #request.role == T(com.vendorbridge.shared.enums.Role).MANAGER")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("User registered successfully", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Logged in successfully", authService.login(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success("Token refreshed successfully", authService.refreshToken(request));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            authService.logout(token.substring(7));
        }
        return ApiResponse.success("Logged out successfully", null);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.success("Password reset instructions sent", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Password reset successfully", null);
    }
}
