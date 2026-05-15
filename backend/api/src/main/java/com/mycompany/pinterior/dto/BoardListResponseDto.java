package com.mycompany.pinterior.dto;

import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class BoardListResponseDto {
	private Long boardId;
	private String boardName;
	private int pinCount;
	private Date updatedAt;
	private List<String> thumbnails;
	private String thumbnailStr;
	private String boardInfo;
}
