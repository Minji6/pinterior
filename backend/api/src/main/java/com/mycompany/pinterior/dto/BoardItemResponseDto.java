package com.mycompany.pinterior.dto;

import lombok.Data;

@Data
public class BoardItemResponseDto {
	private Long pinId;
	private String title;
    private String imageUrl;
    private String linkUrl;
	
}
