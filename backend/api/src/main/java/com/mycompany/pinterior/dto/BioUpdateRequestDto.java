package com.mycompany.pinterior.dto;

import jakarta.validation.constraints.Size;

public class BioUpdateRequestDto {
	@Size(max = 200, message = "소개는 200자 이내로 입력해주세요.")
	private String bio;
	
	public String getBio() {
		return bio;
	}
	public void setBio(String bio) {
		this.bio = bio;
	}
}
