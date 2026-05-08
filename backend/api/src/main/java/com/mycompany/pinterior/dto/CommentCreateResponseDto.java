package com.mycompany.pinterior.dto;

import java.util.Date;

import lombok.Data;

@Data
public class CommentCreateResponseDto {
	private Long commentId;
    private Long userId;
    private String userNickname;
    private String userProfileImg;
    private Long pinId;
    private String content;
    private Date createdAt;
}
