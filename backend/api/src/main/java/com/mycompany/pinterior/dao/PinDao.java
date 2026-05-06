package com.mycompany.pinterior.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mycompany.pinterior.dto.PinSummaryDto;
import com.mycompany.pinterior.entity.Pin;

@Mapper
public interface PinDao {
	public int insert(Pin pin);

	// ===== 김효: 전체 핀 목록 조회 =====
	List<PinSummaryDto> selectList(@Param("cursorId") Long cursorId, @Param("size") int size);
}
