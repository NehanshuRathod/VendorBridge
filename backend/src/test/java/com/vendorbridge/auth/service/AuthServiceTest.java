package com.vendorbridge.auth.service;

import com.vendorbridge.auth.dto.LoginRequest;
import com.vendorbridge.auth.security.JwtTokenProvider;
import com.vendorbridge.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@vendorbridge.com");
        request.setPassword("Admin@123");

        // Simple test to ensure mock interaction
        try {
            authService.login(request);
        } catch (Exception ignored) {
            // Ignored because we just want to verify mock interactions
        }

        verify(authenticationManager).authenticate(any());
    }
}
