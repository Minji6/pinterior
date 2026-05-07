package com.mycompany.pinterior.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.ProfileImageResponseDto;
import com.mycompany.pinterior.exception.ApiException;
import com.mycompany.pinterior.service.ProfileImageService;

@RestController
@RequestMapping("/api/users")
public class ProfileImageController {

    @Autowired
    private ProfileImageService profileImageService;

    //  프로필 이미지 등록 / 수정
    @PutMapping(value = "/{userId}/image", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ProfileImageResponseDto>> uploadProfileImage(
            @PathVariable("userId") Long userId,
            @RequestParam("image") MultipartFile image,
            HttpServletRequest request) {

        // 본인 여부 확인
        Long loginUserId = (Long) request.getAttribute("userId");
        if (!loginUserId.equals(userId)) {
            throw new ApiException(403, "본인 프로필만 수정할 수 있습니다.");
        }

        ProfileImageResponseDto data = profileImageService.updateProfileImage(userId, image);
        return ResponseEntity.ok(ApiResponse.of(200, "프로필 이미지 수정 성공", data));
    }
}