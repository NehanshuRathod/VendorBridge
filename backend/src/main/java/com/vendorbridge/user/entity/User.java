package com.vendorbridge.user.entity;

import com.vendorbridge.shared.entity.BaseEntity;
import com.vendorbridge.shared.enums.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    private String email;
    private String passwordHash;
    private String fullName;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Builder.Default
    private boolean active = true;
}
