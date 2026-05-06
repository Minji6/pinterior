package com.mycompany.pinterior.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PinSummaryDto {
	private Long pinId;
	private String imageUrl;
	private String title;
	private Long boardId;
	private LocalDateTime createdAt;	
}