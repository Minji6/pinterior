package com.mycompany.pinterior.entity;


import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class Pin {
	private Long pinId;
	private Long userId;
	private Long boardId;
	private String title;
	private String description;
	private String imageUrl;
	private String linkUrl;
	private Date createdAt;
	private Date updatedAt;
	private List<String> tags;
	private byte[] imageData;
}
