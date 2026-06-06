package com.vendorbridge.rfq.entity;

import com.vendorbridge.shared.entity.BaseEntity;
import jakarta.persistence.Entity;
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
@Table(name = "rfq_attachments")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqAttachment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    private Rfq rfq;

    private String fileName;
    private String fileKey;
    private String contentType;
    private LocalDateTime uploadedAt;
}
