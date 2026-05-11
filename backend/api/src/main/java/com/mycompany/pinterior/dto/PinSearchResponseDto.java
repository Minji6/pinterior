package com.mycompany.pinterior.dto;

import java.util.List;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PinSearchResponseDto {
	private Long pinId;
	private String imageUrl;
	private String title;
	private List<String> tags;
	private LocalDateTime createdAt;
}
