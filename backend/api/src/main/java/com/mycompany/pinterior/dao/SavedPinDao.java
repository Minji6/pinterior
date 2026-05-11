package com.mycompany.pinterior.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mycompany.pinterior.entity.SavedPin;

@Mapper
public interface SavedPinDao {

	public int insert(SavedPin savedPin);

	int countDuplicate(@Param("userId") Long userId, @Param("pinId") Long pinId, @Param("boardId") Long boardId);

	int countPinById(@Param("pinId") Long pinId);

	Long selectBoardOwnerByBoardId(@Param("boardId") Long boardId);
	
	Long selectUserIdBySavedPinId(@Param("savedPinId") Long savedPinId);
	
	int deleteSavedPin(@Param("savedPinId") Long savedPinId);
	
	SavedPin selectById(@Param("savedPinId") Long savedPinId);
	
	int countNullBoardByUserAndPin(@Param("userId") Long userId, @Param("pinId") Long pinId, @Param("excludeSavedPinId") Long excludeSavedPinId);
	
	int updateBoardIdToNull(@Param("savedPinId") Long savedPinId);
	

}
