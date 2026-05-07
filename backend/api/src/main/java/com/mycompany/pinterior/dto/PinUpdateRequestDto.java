package com.mycompany.pinterior.dto;


import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PinUpdateRequestDto {
    private int userId;
    private String title;
    private String description;
    private String linkUrl;

    @NotNull(message = "태그는 필수입니다.")
    @NotEmpty(message = "태그는 1개 이상이어야 합니다.")
    private List<@NotBlank(message = "태그에 빈 값을 포함할 수 없습니다.") String> tags;
}
