package com.vendorbridge.shared.exceptions;

import lombok.Getter;

import java.util.Map;

@Getter
public class ValidationException extends RuntimeException {

    private final Map<String, String> errors;

    public ValidationException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors;
    }

    public ValidationException(Map<String, String> errors) {
        super("Validation failed");
        this.errors = errors;
    }
}
