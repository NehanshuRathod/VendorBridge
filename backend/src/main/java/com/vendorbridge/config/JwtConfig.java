package com.vendorbridge.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "vendorbridge.jwt")
public class JwtConfig {

    /**
     * Base64-encoded HMAC secret used to sign JWT tokens.
     */
    private String secret = "dGhpcyBpcyBhIHZlcnkgc2VjdXJlIGp3dCBzaWduaW5nIGtleSBmb3IgdmVuZG9yYnJpZGdl";

    /**
     * Access token expiration in milliseconds. Default: 15 minutes.
     */
    private long accessTokenExpiry = 900_000L;

    /**
     * Refresh token expiration in milliseconds. Default: 7 days.
     */
    private long refreshTokenExpiry = 604_800_000L;
}
