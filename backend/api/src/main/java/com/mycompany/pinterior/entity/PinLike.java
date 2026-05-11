package com.mycompany.pinterior.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PinLike {
	private Long userId;
	private Long pinId;
	private LocalDateTime createdAt;
}
