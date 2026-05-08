package com.mycompany.pinterior.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SavedPin {
	private Long savedPinId;
	private Long pinId;
	private Long boardId;
	private Long userId;
	private LocalDateTime createdAt;

}
