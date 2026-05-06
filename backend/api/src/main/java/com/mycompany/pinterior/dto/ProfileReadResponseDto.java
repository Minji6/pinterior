package com.mycompany.pinterior.dto;

import com.mycompany.pinterior.entity.Users;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class ProfileReadResponseDto {
    private Long userId;
    private String email;
    private String nickname;
    private String profileImg;
    private String bio;
    private LocalDateTime createdAt;

    public static ProfileReadResponseDto from(Users user) {
        return ProfileReadResponseDto.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImg(user.getProfileImg())
                .bio(user.getUserBio())
                .createdAt(user.getCreatedAt())
                .build();
    }
}