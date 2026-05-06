package com.mycompany.pinterior.dto;

import java.util.List;

import lombok.Data;

@Data
public class PinCreateRequestDto {
	private String title;
    private String description;
    private String imageUrl;
    private String linkUrl;
    private List<String> tags;
}
