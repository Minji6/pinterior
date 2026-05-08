package com.mycompany.pinterior.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Users {
	private Long userId;
	private String email;
	private String password;
	private String nickname;
	private String profileImg;
	private byte[] profileImgData;
	private String userBio; 
	private LocalDateTime createdAt; 
	private LocalDateTime updatedAt;
}
