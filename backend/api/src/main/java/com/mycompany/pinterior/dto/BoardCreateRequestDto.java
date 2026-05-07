package com.mycompany.pinterior.dto;

import java.util.Date;

import lombok.Data;

@Data
public class BoardCreateRequestDto {
	private Long boardId;
	private String boardName;
	private String BoardInfo;
}
