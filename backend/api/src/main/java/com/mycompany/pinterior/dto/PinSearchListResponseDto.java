package com.mycompany.pinterior.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PinSearchListResponseDto {
	private List<PinSearchResponseDto> pins;
	private String nextCursor; // 다음 페이지를 위한 커서 (핀 ID 또는 생성 날짜 등)
	private boolean hasNext; // 다음 페이지 존재 여부
	private boolean recommended; // 추천 여부 (검색 결과가 아닌 추천 핀인지 여부)

}
