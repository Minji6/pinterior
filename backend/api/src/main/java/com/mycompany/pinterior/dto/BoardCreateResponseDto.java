package com.mycompany.pinterior.dto;

import java.util.Date;

import com.mycompany.pinterior.entity.Board;

import lombok.Data;

@Data
public class BoardCreateResponseDto {
	private Long boardId;
	private Long userId;
	private String boardName;
	private String BoardInfo;
	private Date createdAt;
	private Date updatedAt;
}
