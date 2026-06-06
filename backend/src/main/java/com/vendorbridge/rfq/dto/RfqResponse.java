package com.vendorbridge.rfq.dto;

import com.vendorbridge.shared.enums.RfqStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class RfqResponse {
    private UUID id;
    private String rfqNumber;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private RfqStatus status;
    private UUID createdById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int itemCount;
    private int vendorAssignmentCount;
}
