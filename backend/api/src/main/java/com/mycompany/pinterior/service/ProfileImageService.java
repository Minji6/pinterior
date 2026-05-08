package com.mycompany.pinterior.service;

import java.io.IOException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.mycompany.pinterior.dao.UserDao;
import com.mycompany.pinterior.dto.ProfileImageResponseDto;
import com.mycompany.pinterior.entity.Users;
import com.mycompany.pinterior.exception.ApiException;

@Service
public class ProfileImageService {

	@Autowired
	private UserDao userDao;

	// 허용 확장자 (API 명세 기준)
	private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "gif");

	// 최대 파일 크기: 10MB
	private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

	// 프로필 이미지 등록 / 수정 (PUT)
	public ProfileImageResponseDto updateProfileImage(Long userId, MultipartFile image) {
		validateImageFile(image);

		byte[] imageBytes;
		try {
			imageBytes = image.getBytes();
		} catch (IOException e) {
			throw new ApiException(500, "서버 에러가 발생했습니다.");
		}

		String imageUrl = "/api/users/" + userId + "/image";
		userDao.updateProfileImage(userId, imageBytes, imageUrl);
		
		return new ProfileImageResponseDto(imageUrl);
	}
	
	// 프로필 이미지 삭제 (DELETE)
	public ProfileImageResponseDto deleteProfileImage(Long userId) {
		Users user = userDao.findProfileImageByUserId(userId);
		if (user == null || (user.getProfileImgData() == null && user.getProfileImg() == null)) {
			throw new ApiException(404, "등록된 프로필 이미지가 없습니다.");
			
		}
		
		userDao.updateProfileImage(userId, null, null);
		
		return new ProfileImageResponseDto(null);
	}

	// 파일 유효성 검사 — 실패 시 ApiException throw
	private void validateImageFile(MultipartFile file) {

		// 파일 존재 여부 및 빈 파일 여부 체크
		if (file == null || file.isEmpty()) {
			throw new ApiException(400, "이미지 형식 오류 또는 용량 초과입니다.");
		}
		// 확장자 체크
		String originalName = file.getOriginalFilename();
		if (originalName == null || !originalName.contains(".")) {
			throw new ApiException(400, "이미지 형식 오류 또는 용량 초과입니다.");
		}
		// 허용된 확장자인지 체크 (대소문자 구분 없이)
		String ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
		if (!ALLOWED_EXTENSIONS.contains(ext)) {
			throw new ApiException(400, "이미지 형식 오류 또는 용량 초과입니다.");
		}
		// 파일 크기 체크
		if (file.getSize() > MAX_FILE_SIZE) {
			throw new ApiException(400, "이미지 형식 오류 또는 용량 초과입니다.");
		}
	}
}