package com.mycompany.pinterior.entity;


import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class Pin {
	private int pinId;
	private String title;
	private String description;
	private String imageUrl;
	private String linkUrl;
	private Date createdAt;
	private Date updatedAt;
	private List<String> tags;
}
