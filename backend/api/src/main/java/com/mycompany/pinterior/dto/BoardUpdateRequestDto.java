package com.mycompany.pinterior.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BoardUpdateRequestDto {
	@NotBlank(message = "보드 이름은 필수입니다.")
	@Size(max=50, message = "보드 이름은 50자 이하여야 합니다.")
	private String boardName;
	private String BoardInfo;
}
