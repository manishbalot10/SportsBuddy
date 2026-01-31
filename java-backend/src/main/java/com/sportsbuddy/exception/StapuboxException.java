package com.sportsbuddy.exception;

import lombok.Getter;

@Getter
public class StapuboxException extends RuntimeException {
    
    private final ErrorCode code;
    private final boolean retryable;

    public StapuboxException(ErrorCode code, String message) {
        super(message);
        this.code = code;
        this.retryable = code.isRetryable();
    }

    public StapuboxException(ErrorCode code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.retryable = code.isRetryable();
    }

    @Getter
    public enum ErrorCode {
        API_TIMEOUT(true),
        API_RATE_LIMITED(true),
        API_UNAVAILABLE(true),
        INVALID_RESPONSE(false),
        PARSE_ERROR(false),
        VALIDATION_ERROR(false);

        private final boolean retryable;

        ErrorCode(boolean retryable) {
            this.retryable = retryable;
        }
    }
}
