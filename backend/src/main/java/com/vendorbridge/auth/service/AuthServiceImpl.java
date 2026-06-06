package com.vendorbridge.auth.service;

import com.vendorbridge.auth.dto.AuthResponse;
import com.vendorbridge.auth.dto.ForgotPasswordRequest;
import com.vendorbridge.auth.dto.LoginRequest;
import com.vendorbridge.auth.dto.RefreshTokenRequest;
import com.vendorbridge.auth.dto.RegisterRequest;
import com.vendorbridge.auth.dto.ResetPasswordRequest;
import com.vendorbridge.auth.security.JwtTokenProvider;
import com.vendorbridge.shared.enums.Role;
import com.vendorbridge.shared.exceptions.BusinessRuleException;
import com.vendorbridge.shared.exceptions.ResourceNotFoundException;
import com.vendorbridge.user.entity.User;
import com.vendorbridge.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RabbitTemplate rabbitTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";
    private static final String BLACKLIST_PREFIX = "blacklist:";
    private static final String RESET_TOKEN_PREFIX = "reset_token:";

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleException("Email already exists");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.VENDOR_USER;
        
        // Only ADMIN can assign ADMIN role; Procurement and Manager can self-register.
        if (role == Role.ADMIN) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                throw new BusinessRuleException("You do not have permission to assign this role");
            }
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .active(true)
                .build();

        user = userRepository.save(user);

        org.springframework.security.core.userdetails.UserDetails userDetails = 
                org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(user.getRole().name())
                .build();

        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        String jti = jwtTokenProvider.extractJti(refreshToken);
        long refreshTokenExpiry = jwtTokenProvider.getExpirationFromToken(refreshToken).getTime() - System.currentTimeMillis();
        
        redisTemplate.opsForValue().set(REFRESH_TOKEN_PREFIX + userDetails.getUsername(), jti, refreshTokenExpiry, TimeUnit.MILLISECONDS);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        org.springframework.security.core.userdetails.UserDetails userDetails = 
                (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();

        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        String jti = jwtTokenProvider.extractJti(refreshToken);
        long refreshTokenExpiry = jwtTokenProvider.getExpirationFromToken(refreshToken).getTime() - System.currentTimeMillis();
        
        redisTemplate.opsForValue().set(REFRESH_TOKEN_PREFIX + userDetails.getUsername(), jti, refreshTokenExpiry, TimeUnit.MILLISECONDS);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessRuleException("Invalid refresh token");
        }

        String email = jwtTokenProvider.extractEmail(refreshToken);
        String storedJti = (String) redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + email);
        String tokenJti = jwtTokenProvider.extractJti(refreshToken);

        if (storedJti == null || !storedJti.equals(tokenJti)) {
            throw new BusinessRuleException("Refresh token was invalidated");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Use custom user details or load it properly
        org.springframework.security.core.userdetails.UserDetails userDetails = 
                org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(user.getRole().name())
                .build();

        String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        String newJti = jwtTokenProvider.extractJti(newRefreshToken);
        long refreshTokenExpiry = jwtTokenProvider.getExpirationFromToken(newRefreshToken).getTime() - System.currentTimeMillis();
        
        redisTemplate.opsForValue().set(REFRESH_TOKEN_PREFIX + email, newJti, refreshTokenExpiry, TimeUnit.MILLISECONDS);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Override
    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String jti = jwtTokenProvider.extractJti(token);
            long expiry = jwtTokenProvider.getExpirationFromToken(token).getTime() - System.currentTimeMillis();
            
            if (expiry > 0) {
                redisTemplate.opsForValue().set(BLACKLIST_PREFIX + jti, "true", expiry, TimeUnit.MILLISECONDS);
            }
            
            String email = jwtTokenProvider.extractEmail(token);
            redisTemplate.delete(REFRESH_TOKEN_PREFIX + email);
        }
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String resetToken = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        
        redisTemplate.opsForValue().set(RESET_TOKEN_PREFIX + user.getEmail(), resetToken, 30, TimeUnit.MINUTES);

        Map<String, Object> event = Map.of(
            "userId", user.getId(),
            "type", "SYSTEM",
            "title", "Password Reset",
            "message", "Your password reset code is: " + resetToken,
            "recipientEmail", user.getEmail()
        );
        rabbitTemplate.convertAndSend("vendorbridge.events", "event.notification.email", event);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Needs email in the request normally, assuming it's part of ResetPasswordRequest or we look up by token
        // In a real system, the token maps back to the email.
        throw new UnsupportedOperationException("Reset password requires email lookup which is not fully implemented in this method signature");
    }
}
