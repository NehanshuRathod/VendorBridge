package com.vendorbridge.auth.service;

import com.vendorbridge.auth.dto.AuthResponse;
import com.vendorbridge.auth.dto.ForgotPasswordRequest;
import com.vendorbridge.auth.dto.LoginRequest;
import com.vendorbridge.auth.dto.RefreshTokenRequest;
import com.vendorbridge.auth.dto.RegisterRequest;
import com.vendorbridge.auth.dto.ResetPasswordRequest;
import com.vendorbridge.user.dto.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(String accessToken);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
