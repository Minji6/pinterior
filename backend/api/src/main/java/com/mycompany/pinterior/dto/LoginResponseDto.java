package com.mycompany.pinterior.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDto {
	private String token;
	private Long userId;
	private String nickname;
	private String profileImg;
}