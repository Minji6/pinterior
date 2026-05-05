package com.mycompany.pinterior.exception;

/**
 * 커스텀 런타임 예외. HTTP 상태 코드를 함께 담아 전역 예외처리기에서 사용합니다.
 */
public class ApiException extends RuntimeException {
    private final int status;

    public ApiException(int status, String message) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
