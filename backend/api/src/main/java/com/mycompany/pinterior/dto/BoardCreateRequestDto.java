package com.mycompany.pinterior.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BoardCreateRequestDto {
	private Long boardId;
	@NotBlank(message = "보드 이름은 필수입니다.")
	private String boardName;
	private String BoardInfo;
}
