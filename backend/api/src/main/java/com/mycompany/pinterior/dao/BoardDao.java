package com.mycompany.pinterior.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mycompany.pinterior.dto.BoardItemResponseDto;
import com.mycompany.pinterior.dto.BoardListResponseDto;
import com.mycompany.pinterior.entity.Board;
import com.mycompany.pinterior.entity.SavedPin;

@Mapper
public interface BoardDao {
	public int insertBoard(Board board);
	public Board selectByBoardId(Long boardId);
	public List<BoardListResponseDto> selectBoardListByUserId(Long userId);
	public List<BoardItemResponseDto> selectPinsByBoardId(Long boardId); 
	public int updateBoard(Board board);
	public int deleteBoard(Long boardId);
    // 보드 삭제 시 saved_pin 처리용
    public List<SavedPin> selectSavedPinsByBoardId(Long boardId);
    public int countNullBoardSavedPin(@Param("userId") Long userId, @Param("pinId") Long pinId);
    public int deleteSavedPinById(Long savedPinId);
    public int updateBoardIdToNull(Long boardId);
}
