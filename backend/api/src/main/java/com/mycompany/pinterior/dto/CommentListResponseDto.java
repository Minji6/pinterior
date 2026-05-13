package com.mycompany.pinterior.dto;

import java.util.List;

import lombok.Data;

@Data
public class CommentListResponseDto {
	private List<CommentResponseDto> comments;
    private int total;
    private int page;
}
