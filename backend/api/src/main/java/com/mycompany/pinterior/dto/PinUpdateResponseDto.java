package com.mycompany.pinterior.dto;

import java.util.Date;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Valid
public class PinUpdateResponseDto {
	private Long pinId;
	private Long userId;
	@Size(max = 200, message = "제목은 200자를 초과할 수 없습니다.")
	private String title;
	@Size(max = 1000, message = "설명은 1000자를 초과할 수 없습니다.")
	private String description;
	private String linkUrl;
	private List<String> tags;
	private Long boardId;
	private Date updatedAt;
}
