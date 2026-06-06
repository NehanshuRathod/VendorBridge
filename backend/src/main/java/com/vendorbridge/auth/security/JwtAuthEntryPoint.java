package com.vendorbridge.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vendorbridge.shared.dto.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    /**
     * Called when an unauthenticated user tries to access a secured resource.
     * Returns a 401 Unauthorized JSON response in the ApiResponse format.
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException)
            throws IOException, ServletException {

        log.warn("Unauthorized access attempt to '{}': {}",
                request.getRequestURI(), authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpStatus.UNAUTHORIZED.value());

        ApiResponse<Void> apiResponse = ApiResponse.error(
                "Unauthorized: " + authException.getMessage()
        );

        objectMapper.writeValue(response.getOutputStream(), apiResponse);
    }
}
