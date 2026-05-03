package com.mycompany.pinterior.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

	private final Key key;
	private final long expiration = 86400000; // 24시간

	public JwtTokenProvider(@Value("${jwt.secret.key}") String secret) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes());
	}

	// 토큰 생성
	public String generateToken(Long userId, String email) {
		return Jwts.builder().subject(String.valueOf(userId)).claim("email", email).issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + expiration)).signWith(key).compact();
	}

	// 토큰에서 userId 추출
	public Long getUserId(String token) {
		return Long.parseLong(Jwts.parser().verifyWith((javax.crypto.SecretKey) key).build().parseSignedClaims(token)
				.getPayload().getSubject());
	}

	// 토큰 유효성 검사
	public boolean validateToken(String token) {
		try {
			Jwts.parser().verifyWith((javax.crypto.SecretKey) key).build().parseSignedClaims(token);
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}
}