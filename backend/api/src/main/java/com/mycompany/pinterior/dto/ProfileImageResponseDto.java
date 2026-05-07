package com.mycompany.pinterior.dto;

import lombok.Data;

@Data
public class ProfileImageResponseDto {
    private String profileImg;

    public ProfileImageResponseDto(String profileImg) {
        this.profileImg = profileImg;
    }
}