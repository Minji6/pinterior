package com.mycompany.pinterior.dto;

import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class PinUpdateResponseDto {
	private int pinId;
	private int userId;
	private String title;
	private String description;
	private String linkUrl;
	private List<String> tags;
	private int boardId;
	private Date updatedAt;
}
