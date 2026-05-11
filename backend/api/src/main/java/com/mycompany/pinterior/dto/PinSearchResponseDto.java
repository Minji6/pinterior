package com.mycompany.pinterior.dto;

import java.util.List;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PinSearchResponseDto {
	private Long pinId;
	private String imageUrl;
	private String title;
	private String tags;
	private List<String> tagList;
	private LocalDateTime createdAt;
}
