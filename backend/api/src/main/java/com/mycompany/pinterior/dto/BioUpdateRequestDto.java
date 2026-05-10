package com.mycompany.pinterior.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BioUpdateRequestDto {
    @Size(max = 200, message = "소개는 200자 이내로 입력해주세요.")
    private String bio;
}