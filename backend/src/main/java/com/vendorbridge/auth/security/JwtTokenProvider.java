package com.vendorbridge.auth.security;

import com.vendorbridge.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtConfig jwtConfig;

    /**
     * Generate an access token for the given user.
     * Claims: sub=email, roles, jti=UUID, iat, exp (configured access token expiry).
     */
    public String generateAccessToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getAccessTokenExpiry());

        String roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(userDetails.getUsername())
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), Jwts.SIG.HS512)
                .compact();
    }

    /**
     * Generate a refresh token for the given user.
     * Claims: sub=email, jti=UUID, iat, exp (configured refresh token expiry).
     */
    public String generateRefreshToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getRefreshTokenExpiry());

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(userDetails.getUsername())
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), Jwts.SIG.HS512)
                .compact();
    }

    /**
     * Extract the email (subject) from a JWT token.
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extract the JTI (JWT ID) from a token — used for blacklisting.
     */
    public String extractJti(String token) {
        return extractAllClaims(token).getId();
    }

    /**
     * Validate a JWT token: verifies signature and checks expiration.
     *
     * @param token the JWT token string
     * @return true if the token is valid and not expired
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
            return false;
        } catch (JwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get the expiration date from a JWT token.
     */
    public Date getExpirationFromToken(String token) {
        return extractAllClaims(token).getExpiration();
    }

    /**
     * Get remaining milliseconds until the token expires.
     */
    public long getRemainingExpiration(String token) {
        Date expiration = getExpirationFromToken(token);
        return Math.max(0, expiration.getTime() - System.currentTimeMillis());
    }

    /**
     * Parse all claims from the JWT token.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Derive the HMAC-SHA signing key from the configured secret.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
