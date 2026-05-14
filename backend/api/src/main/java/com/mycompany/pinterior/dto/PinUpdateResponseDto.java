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
	private String title;
	private String description;
	private String linkUrl;
	private List<String> tags;
	private Date updatedAt;
}
