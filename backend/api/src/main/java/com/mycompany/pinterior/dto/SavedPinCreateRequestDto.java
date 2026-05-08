package com.mycompany.pinterior.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SavedPinCreateRequestDto {
	
	@NotNull(message = "pinId는 필수입니다.")
	private Long pinId;
	private Long boardId; 
}
