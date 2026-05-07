package com.mycompany.pinterior.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PinDetailResponseDto {
	private Long pinId;
	private String imageUrl;
	private String title;
	private String description;
	private String linkUrl;
	private AuthorDto author;
	private List<String> tags;
	private Long boardId;
	private LocalDateTime createdAt;
	
	private int likeCount;
	private boolean isLiked;
	private int commentEnabled;
	
}
