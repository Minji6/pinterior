package com.mycompany.pinterior.dto;

import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class PinUpdateResponseDto {
	private Long pinId;
	private Long userId;
	private String title;
	private String description;
	private String linkUrl;
	private List<String> tags;
	private Long boardId;
	private Date updatedAt;
}
