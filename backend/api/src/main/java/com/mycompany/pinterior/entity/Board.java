package com.mycompany.pinterior.entity;

import java.util.Date;

import lombok.Data;

@Data
public class Board {
	private Long boardId;
	private Long userId;
	private String boardName;
	private String BoardInfo;
	private Date createdAt;
	private Date updatedAt;
}
