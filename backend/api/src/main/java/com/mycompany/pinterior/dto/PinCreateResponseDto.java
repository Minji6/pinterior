package com.mycompany.pinterior.dto;

import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class PinCreateResponseDto {
    private int pinId;
    private String imageUrl;
    private String title;
    private String description;
    private String linkUrl;
    private List<String> tags;
    private Date createdAt;
}
