package com.mycompany.pinterior.service;

import com.mycompany.pinterior.dao.UserDao;
import com.mycompany.pinterior.dto.BioUpdateRequestDto;
import com.mycompany.pinterior.dto.BioUpdateResponseDto;
import com.mycompany.pinterior.dto.LoginRequestDto;
import com.mycompany.pinterior.dto.LoginResponseDto;
import com.mycompany.pinterior.dto.NicknameUpdateRequestDto;
import com.mycompany.pinterior.dto.NicknameUpdateResponseDto;
import com.mycompany.pinterior.entity.Users;
import com.mycompany.pinterior.exception.ApiException;
import com.mycompany.pinterior.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

	private final UserDao userDao;
	private final JwtTokenProvider jwtTokenProvider;
	private final PasswordEncoder passwordEncoder;

	// 로그인
	public LoginResponseDto login(LoginRequestDto request) {
		// 이메일로 유저 조회
		Map<String, Object> user = userDao.findByEmail(request.getEmail());

		if (user == null) {
			// 인증 실패: 이메일이 존재하지 않거나 잘못된 자격증명
			throw new ApiException(401, "이메일 또는 비밀번호가 올바르지 않습니다.");
		}

		// 비밀번호 검증
		String storedPassword = (String) user.get("PASSWORD");
		if (!passwordEncoder.matches(request.getPassword(), storedPassword)) {
			// 인증 실패: 비밀번호 불일치
			throw new ApiException(401, "이메일 또는 비밀번호가 올바르지 않습니다.");
		}

		// JWT 발급
		Long userId = ((Number) user.get("USER_ID")).longValue();
		String email = (String) user.get("EMAIL");
		String nickname = (String) user.get("NICKNAME");
		String profileImg = (String) user.get("PROFILE_IMG");

		String token = jwtTokenProvider.generateToken(userId, email);
		log.info("로그인 성공 - userId: {}, email: {}", userId, email);

		return new LoginResponseDto(token, userId, nickname, profileImg);
	}

	// 닉네임 수정
	public NicknameUpdateResponseDto updateNickname(Long loginUserId, Long targetUserId,
			NicknameUpdateRequestDto request) {
		// 본인 확인 - JWT 토큰에서 추출한 userId와 요청된 userId가 일치하는지 확인
		if (!loginUserId.equals(targetUserId)) {
			throw new ApiException(403, "본인만 닉네임을 수정할 수 있습니다.");
		}

		// 유저 존재 확인
		if (userDao.findById(targetUserId) == null) {
			throw new ApiException(404, "유저를 찾을 수 없습니다.");
		}

		// 닉네임 중복 확인 - 다른 사람이 이미 쓰는 닉네임이면 409
		// 본인이 현재 동일 닉네임을 쓰는 경우는 중복으로 처리하지 않음
		Users existingUser = userDao.findByNickname(request.getNickname());
		if (existingUser != null && !existingUser.getUserId().equals(targetUserId)) {
			throw new ApiException(409, "이미 사용 중인 닉네임입니다.");
		}

		// 닉네임 업데이트
		userDao.updateNickname(targetUserId, request.getNickname());

		log.info("닉네임 수정 성공 - userId: {}, newNickname: {}", targetUserId, request.getNickname());
		return new NicknameUpdateResponseDto(request.getNickname());

	}

	// 소개 수정
	public BioUpdateResponseDto updateBio(Long loginUserId, Long targetUserId, BioUpdateRequestDto request) {
		if (!loginUserId.equals(targetUserId)) {
			throw new ApiException(403, "본인만 소개를 수정할 수 있습니다.");
		}
		
		// null, 빈 문자열, 공백 -> null로 처리
		String bio = (request.getBio() == null || request.getBio().isBlank()) ? null : request.getBio().trim();
		
		// DB 업데이트
		userDao.updateBio(loginUserId, bio);
		return new BioUpdateResponseDto(bio);
	}
}