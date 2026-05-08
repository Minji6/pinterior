package com.mycompany.pinterior.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NicknameUpdateRequestDto {
	@NotBlank(message = "닉네임을 입력해주세요.")
	@Size(min = 2, max = 20, message = "닉네임은 2자 이상 20자 이하로 입력해주세요.")
	private String nickname;
}
