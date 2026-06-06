package com.vendorbridge.user.dto;

import com.vendorbridge.shared.enums.Role;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @Size(min = 1, max = 255, message = "Full name must be between 1 and 255 characters")
    private String fullName;

    private Role role;

    private Boolean active;
}
