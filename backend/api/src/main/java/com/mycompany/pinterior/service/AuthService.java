package com.mycompany.pinterior.service;

import com.mycompany.pinterior.dao.UserDao;
import com.mycompany.pinterior.dto.LoginRequestDto;
import com.mycompany.pinterior.dto.LoginResponseDto;
import com.mycompany.pinterior.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserDao userDao;
	private final JwtTokenProvider jwtTokenProvider;
	private final PasswordEncoder passwordEncoder;

	public LoginResponseDto login(LoginRequestDto request) {
		// 이메일로 유저 조회
		Map<String, Object> user = userDao.findByEmail(request.getEmail());

		if (user == null) {
			throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
		}

		// 비밀번호 검증
		String storedPassword = (String) user.get("PASSWORD");
		if (!passwordEncoder.matches(request.getPassword(), storedPassword)) {
			throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
		}

		// JWT 발급
		Long userId = ((Number) user.get("USER_ID")).longValue();
		String email = (String) user.get("EMAIL");
		String nickname = (String) user.get("NICKNAME");
		String profileImg = (String) user.get("PROFILE_IMG");

		String token = jwtTokenProvider.generateToken(userId, email);

		return new LoginResponseDto(token, userId, nickname, profileImg);
	}
}