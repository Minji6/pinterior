package com.mycompany.pinterior.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.mycompany.pinterior.dto.BoardItemResponseDto;
import com.mycompany.pinterior.dto.BoardListResponseDto;
import com.mycompany.pinterior.entity.Board;

@Mapper
public interface BoardDao {
	public int insertBoard(Board board);
	public Board selectByBoardId(Long boardId);
	public List<BoardListResponseDto> selectBoardListByUserId(Long userId);
	public List<BoardItemResponseDto> selectPinsByBoardId(Long boardId); 
	public int updateBoard(Board board);
	public int deleteBoard(Long boardId);
}
