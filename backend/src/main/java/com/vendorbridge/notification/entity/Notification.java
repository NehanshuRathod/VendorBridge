package com.vendorbridge.notification.entity;

import com.vendorbridge.shared.entity.BaseEntity;
import com.vendorbridge.shared.enums.NotificationType;
import com.vendorbridge.user.entity.User;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    private User recipient;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String title;
    private String message;
    private String referenceId;
    
    @Builder.Default
    private boolean read = false;
    
    private LocalDateTime readAt;
}
