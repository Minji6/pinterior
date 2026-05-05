package com.mycompany.pinterior.controller;

import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.LoginRequestDto;
import com.mycompany.pinterior.dto.LoginResponseDto;
import com.mycompany.pinterior.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@RequestBody LoginRequestDto request) {
        LoginResponseDto data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.of(200, "로그인 성공", data));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.of(200, "로그아웃 성공", null));
    }
}