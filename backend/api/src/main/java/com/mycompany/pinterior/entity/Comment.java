package com.mycompany.pinterior.entity;

import java.util.Date;

import lombok.Data;

@Data
public class Comment {
	private Long commentId;
	private Long userId;
	private Long pinId;
	private String commentContent;
	private Date createdAt;
	private Date updatedAt;
	private Long parentId;
	
	// 유저 정보 (조회용)
    private String userNickname;
    private String userProfileImg;
}
