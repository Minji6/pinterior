package com.mycompany.pinterior.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavedPinResponseDto {
	private Long savedPinId;
    private Long userId;
    private Long pinId;
    private Long boardId;
    private LocalDateTime createdAt;
}
