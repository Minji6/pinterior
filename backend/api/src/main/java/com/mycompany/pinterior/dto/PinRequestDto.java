package com.mycompany.pinterior.dto;

import java.util.List;

import lombok.Data;

@Data
public class PinRequestDto {
	private String title;
	private String description;
	private String imgUrl;
	private String linkUrl;
	private List<String> tags; // 태그 목록 추가

}
