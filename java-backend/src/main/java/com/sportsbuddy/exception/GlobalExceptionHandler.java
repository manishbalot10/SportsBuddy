package com.sportsbuddy.exception;

import jakarta.validation.ConstraintViolationException;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(StapuboxException.class)
    public ResponseEntity<ErrorResponse> handleStapuboxException(StapuboxException ex) {
        log.error("Stapubox API error: {} - {}", ex.getCode(), ex.getMessage());
        
        ErrorResponse response = ErrorResponse.builder()
                .code(ex.getCode().name())
                .message(ex.getMessage())
                .retryable(ex.isRetryable())
                .timestamp(Instant.now())
                .build();

        HttpStatus status = ex.isRetryable() ?
                HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.BAD_REQUEST;

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation error");

        ErrorResponse response = ErrorResponse.builder()
                .code("VALIDATION_ERROR")
                .message(message)
                .retryable(false)
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation constraint violated");

        ErrorResponse response = ErrorResponse.builder()
                .code("VALIDATION_ERROR")
                .message(message)
                .retryable(false)
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex) {
        ErrorResponse response = ErrorResponse.builder()
                .code("MISSING_PARAMETER")
                .message("Required parameter missing: " + ex.getParameterName())
                .retryable(false)
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String paramName = ex.getName();
        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        
        ErrorResponse response = ErrorResponse.builder()
                .code("VALIDATION_ERROR")
                .message("Invalid parameter type for '" + paramName + "': expected " + requiredType)
                .retryable(false)
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoResourceFoundException ex) {
        ErrorResponse response = ErrorResponse.builder()
                .code("NOT_FOUND")
                .message("Endpoint not found: " + ex.getResourcePath())
                .retryable(false)
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error: ", ex);
        
        ErrorResponse response = ErrorResponse.builder()
                .code("INTERNAL_ERROR")
                .message("An unexpected error occurred")
                .retryable(true)
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @Data
    @Builder
    public static class ErrorResponse {
        private String code;
        private String message;
        private boolean retryable;
        private Instant timestamp;
    }
}
