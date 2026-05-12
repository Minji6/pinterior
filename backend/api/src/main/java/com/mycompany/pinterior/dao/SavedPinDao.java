package com.mycompany.pinterior.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mycompany.pinterior.dto.SavedPinListResponseDto;
import com.mycompany.pinterior.entity.SavedPin;

@Mapper
public interface SavedPinDao {

	public int insert(SavedPin savedPin);

	int countDuplicate(@Param("userId") Long userId, @Param("pinId") Long pinId, @Param("boardId") Long boardId);

	int countPinById(@Param("pinId") Long pinId);

	Long selectBoardOwnerByBoardId(@Param("boardId") Long boardId);
	
	Long selectUserIdBySavedPinId(@Param("savedPinId") Long savedPinId);
	
	int deleteSavedPin(@Param("savedPinId") Long savedPinId);
	List<SavedPinListResponseDto> selectSavedPinsByUserId(Long userId);	// 핀 선택 보드 id 가져오기
	SavedPin selectByPinId(Long pinId);
}
