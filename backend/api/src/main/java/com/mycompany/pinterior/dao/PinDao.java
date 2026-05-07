package com.mycompany.pinterior.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mycompany.pinterior.dto.PinSummaryDto;
import com.mycompany.pinterior.entity.Pin;

@Mapper
public interface PinDao {
	// 핀 등록 
	public int insert(Pin pin);

	// 핀 수정 
	public int update(Pin pin);
	
	// 핀 삭제
	public int deleteByPinId(int pinId);
	
	// 핀 단건 조회
	Pin selectById(int pinId);
	
	// ===== 김효: 전체 핀 목록 조회 =====
	List<PinSummaryDto> selectList(@Param("cursorId") Long cursorId, @Param("size") int size);
}
