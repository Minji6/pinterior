package com.mycompany.pinterior.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SavedPinListResponseDto {
	Long savedPinId;
	Long pinId;
	Long boardId;
	String imageUrl;
	String title;
	LocalDateTime createdAt;
}
