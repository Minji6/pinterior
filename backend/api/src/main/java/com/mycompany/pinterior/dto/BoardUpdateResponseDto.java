package com.mycompany.pinterior.dto;

import java.util.Date;

import lombok.Data;

@Data
public class BoardUpdateResponseDto {

	private Long boardId;
	private String boardName;
	private String boardInfo;
	private Date updatedAt;
}
