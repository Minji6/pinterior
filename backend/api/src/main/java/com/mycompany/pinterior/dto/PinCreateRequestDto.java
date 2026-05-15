package com.mycompany.pinterior.dto;

import java.util.List;

import org.hibernate.validator.constraints.URL;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data

public class PinCreateRequestDto {
	private Long boardId;
	
	@NotEmpty(message = "제목은 필수입니다.")
    @NotNull(message = "제목은 필수입니다.")
	private String title;
    private String description;
    private String imageUrl;
    @URL(message = "올바른 URL 형식이 아닙니다.")
    private String linkUrl;
    
    @NotEmpty(message = "태그는 1개 이상이어야 합니다.")
    @NotNull(message = "태그는 필수입니다.")
    private List<@NotBlank(message = "태그에 빈 값을 포함할 수 없습니다.") String> tags;
}
