package com.mycompany.pinterior.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavedPinBoardRemoveResponseDto {
	private Long savedPinId;
	private Long boardId;
}
