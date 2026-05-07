package com.mycompany.pinterior.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mycompany.pinterior.dto.AuthorDto;
import com.mycompany.pinterior.dto.PinDetailResponseDto;
import com.mycompany.pinterior.dto.PinSummaryDto;
import com.mycompany.pinterior.entity.Pin;

@Mapper
public interface PinDao {
	// 핀 등록 
	public int insert(Pin pin);
	
	// 핀 단건 조회 
	Pin selectById(Long pinId);

	// 핀 수정 
	public int update(Pin pin);
	
	// 핀 삭제
	public int deleteByPinId(Long pinId);
	
	// ===== 전체 조회 =====
	List<PinSummaryDto> selectList(@Param("cursorId") Long cursorId, @Param("size") int size);

	// ===== 상세 조회 =====
	PinDetailResponseDto selectDetail(@Param("pinId") Long pinId);

	// =====  작성자 조회 =====
	AuthorDto selectAuthorByPinId(@Param("pinId") Long pinId);

	// =====  태그 목록 조회 =====
	List<String> selectTagsByPinId(@Param("pinId") Long pinId);
	
	// ===== 이미지 다운로드 =====
	String selectImageUrlByPinId(@Param("pinId") Long pinId);
}