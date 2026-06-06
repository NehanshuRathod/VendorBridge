package com.vendorbridge.rfq.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateRfqRequest {
    private String title;
    private String description;
    private LocalDateTime deadline;
}
