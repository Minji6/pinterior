package com.mycompany.pinterior.controller;

import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.BioUpdateRequestDto;
import com.mycompany.pinterior.dto.BioUpdateResponseDto;
import com.mycompany.pinterior.dto.LoginRequestDto;
import com.mycompany.pinterior.dto.LoginResponseDto;
import com.mycompany.pinterior.dto.NicknameUpdateRequestDto;
import com.mycompany.pinterior.dto.NicknameUpdateResponseDto;
import com.mycompany.pinterior.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@RequestBody LoginRequestDto request) {
        LoginResponseDto data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.of(200, "로그인 성공", data));
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
    	log.info("로그아웃 성공");
        return ResponseEntity.ok(ApiResponse.of(200, "로그아웃 성공", null));
    }
    
    // 닉네임 등록, 수정
    @PutMapping("/{userId}/nickname")
    public ResponseEntity<ApiResponse<NicknameUpdateResponseDto>> updateNickname(
			@PathVariable("userId") Long userId,
			@RequestAttribute("userId") Long loginUserId,
			@RequestBody @Valid NicknameUpdateRequestDto request
			) {
		NicknameUpdateResponseDto data = authService.updateNickname(loginUserId, userId, request);
		return ResponseEntity.ok(ApiResponse.of(200, "닉네임 수정 성공", data));
	}
    
    // 소개 등록, 수정
    @PutMapping("/{userId}/bio")
    public ResponseEntity<ApiResponse<BioUpdateResponseDto>> updateBio(
    		@PathVariable("userId") Long userId,
    		@RequestBody @Valid BioUpdateRequestDto request) {
    	
    	Long loginUserId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    	BioUpdateResponseDto data = authService.updateBio(loginUserId, userId, request);
    	
    	
    	return ResponseEntity.ok(ApiResponse.of(200, "소개 수정 성공", data));
    }
}