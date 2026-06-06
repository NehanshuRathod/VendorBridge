package com.vendorbridge.rfq.entity;

import com.vendorbridge.shared.entity.BaseEntity;
import com.vendorbridge.shared.enums.RfqStatus;
import com.vendorbridge.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rfqs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rfq extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String rfqNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RfqStatus status = RfqStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "rfq", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RfqItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "rfq", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RfqVendorAssignment> vendorAssignments = new ArrayList<>();
}
