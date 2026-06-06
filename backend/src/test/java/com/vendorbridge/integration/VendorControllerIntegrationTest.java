package com.vendorbridge.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class VendorControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldRejectUnauthenticatedRequest() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/v1/vendors", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
