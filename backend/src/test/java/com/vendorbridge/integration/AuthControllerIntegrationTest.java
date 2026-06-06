package com.vendorbridge.integration;

import com.vendorbridge.auth.dto.LoginRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class AuthControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldFailLoginWithBadCredentials() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@vendorbridge.com");
        request.setPassword("WrongPassword");

        ResponseEntity<String> response = restTemplate.postForEntity("/api/v1/auth/login", request, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
