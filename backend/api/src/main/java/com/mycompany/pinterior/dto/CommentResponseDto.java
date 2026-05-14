package com.mycompany.pinterior.dto;

import java.util.Date;

import lombok.Data;


@Data
public class CommentResponseDto {
    private Long commentId;
    private Long userId;
    private String userNickname;
    private String userProfileImg;
    private String content;
    private Date createdAt;
    private Date updatedAt;
}
