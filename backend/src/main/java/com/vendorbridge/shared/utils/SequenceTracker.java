package com.vendorbridge.shared.utils;

import com.vendorbridge.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sequence_tracker")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SequenceTracker extends BaseEntity {

    @Column(name = "sequence_type", nullable = false, unique = true)
    private String sequenceType;

    @Column(name = "current_year", nullable = false)
    private int currentYear;

    @Column(name = "current_value", nullable = false)
    private long currentValue;
}
