package com.vendorbridge.rfq.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class RfqVendorAssignmentResponse {
    private UUID id;
    private UUID vendorId;
    private String companyName;
    private LocalDateTime invitedAt;
    private boolean responded;
}
