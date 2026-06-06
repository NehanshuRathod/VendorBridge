package com.vendorbridge.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "vendorbridge.mail")
public class MailConfig {

    /**
     * Default "from" email address used when sending emails.
     */
    private String fromAddress = "noreply@vendorbridge.com";

    /**
     * Display name shown in the "from" field.
     */
    private String fromName = "VendorBridge ERP";

    /**
     * Whether email sending is enabled. When false, emails are logged but not sent.
     */
    private boolean enabled = true;
}
