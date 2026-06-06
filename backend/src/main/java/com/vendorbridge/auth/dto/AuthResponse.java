package com.vendorbridge.auth.dto;

import com.vendorbridge.shared.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private String fullName;
    private Role role;
    @Builder.Default
    private String tokenType = "Bearer";
}
