package com.mycompany.pinterior.dto;

import java.util.Date;

import lombok.Data;

@Data
public class CommentUpdateResponseDto {
	private Long commentId;
    private String content;
    private Date updatedAt;
}
