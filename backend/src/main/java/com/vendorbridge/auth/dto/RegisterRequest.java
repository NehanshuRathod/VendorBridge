package com.vendorbridge.auth.dto;

import com.vendorbridge.shared.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$", 
             message = "Password must be at least 8 characters long, contain at least one digit, one lowercase, one uppercase, and one special character")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private Role role;
}
