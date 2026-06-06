package com.vendorbridge.shared.exceptions;

import com.vendorbridge.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        ApiResponse<Void> response = ApiResponse.error(ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(ValidationException ex) {
        log.warn("Validation failed: {}", ex.getMessage());
        ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), ex.getErrors());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        log.warn("Method argument validation failed: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ApiResponse<Void> response = ApiResponse.error("Validation failed", errors);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        ApiResponse<Void> response = ApiResponse.error("Access denied. You do not have permission to perform this action.");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        ApiResponse<Void> response = ApiResponse.error("Authentication failed. Please provide valid credentials.");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessRuleException(BusinessRuleException ex) {
        log.warn("Business rule violation: {}", ex.getMessage());
        ApiResponse<Void> response = ApiResponse.error(ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred: {}", ex.getMessage(), ex);
        ApiResponse<Void> response = ApiResponse.error("An unexpected error occurred. Please try again later.");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
