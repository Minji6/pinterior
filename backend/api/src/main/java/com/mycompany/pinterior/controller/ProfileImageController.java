package com.mycompany.pinterior.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.mycompany.pinterior.dao.UserDao;
import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.ProfileImageResponseDto;
import com.mycompany.pinterior.entity.Users;
import com.mycompany.pinterior.exception.ApiException;
import com.mycompany.pinterior.service.ProfileImageService;

@RestController
@RequestMapping("/api/users")
public class ProfileImageController {

    @Autowired
    private ProfileImageService profileImageService;

    @Autowired
    private UserDao userDao;

    // 프로필 이미지 등록 / 수정
    @PutMapping(value = "/{userId}/image", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ProfileImageResponseDto>> uploadProfileImage(
            @PathVariable("userId") Long userId,
            @RequestParam("image") MultipartFile image,
            HttpServletRequest request) {

        Long loginUserId = (Long) request.getAttribute("userId");
        if (!loginUserId.equals(userId)) {
            throw new ApiException(403, "본인 프로필만 수정할 수 있습니다.");
        }

        ProfileImageResponseDto data = profileImageService.updateProfileImage(userId, image);
        return ResponseEntity.ok(ApiResponse.of(200, "프로필 이미지 수정 성공", data));
    }

    // 프로필 이미지 서빙 (조회)
    @GetMapping("/{userId}/image")
    public ResponseEntity<byte[]> serveProfileImage(@PathVariable("userId") Long userId) {
        Users user = userDao.findProfileImageByUserId(userId);

        if (user == null || user.getProfileImgData() == null) {
            throw new ApiException(404, "등록된 프로필 이미지가 없습니다.");
        }

        String profileImg = user.getProfileImg();
        String mimeType = "image/jpeg";
        if (profileImg != null) {
            if (profileImg.contains("png")) mimeType = "image/png";
            else if (profileImg.contains("gif")) mimeType = "image/gif";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(mimeType));

        return ResponseEntity.ok().headers(headers).body(user.getProfileImgData());
    }

    // 프로필 이미지 삭제
    @DeleteMapping("/{userId}/image/delete")
    public ResponseEntity<ApiResponse<ProfileImageResponseDto>> deleteProfileImage(
            @PathVariable("userId") Long userId,
            HttpServletRequest request) {

        Long loginUserId = (Long) request.getAttribute("userId");
        if (!loginUserId.equals(userId)) {
            throw new ApiException(403, "본인 프로필만 수정할 수 있습니다.");
        }

        ProfileImageResponseDto data = profileImageService.deleteProfileImage(userId);
        return ResponseEntity.ok(ApiResponse.of(200, "프로필 이미지 삭제 성공", data));
    }
}