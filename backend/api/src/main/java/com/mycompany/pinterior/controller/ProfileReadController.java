package com.mycompany.pinterior.controller;

import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.ProfileReadResponseDto;
import com.mycompany.pinterior.service.ProfileReadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ProfileReadController {

    private final ProfileReadService profileReadService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<ProfileReadResponseDto>> getProfile(@PathVariable("userId") Long userId) {
        ProfileReadResponseDto data = profileReadService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.of(200, "프로필 조회 성공", data));
    }
}