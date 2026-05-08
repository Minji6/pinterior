package com.mycompany.pinterior.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentCreateRequestDto {
	@NotBlank(message = "댓글 내용은 필수입니다.")
    @Size(max = 1000, message = "댓글은 최대 1000자까지 입력 가능합니다.")
    private String content;
}
