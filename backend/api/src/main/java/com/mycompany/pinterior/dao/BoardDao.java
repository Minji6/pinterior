package com.mycompany.pinterior.dao;

import org.apache.ibatis.annotations.Mapper;

import com.mycompany.pinterior.entity.Board;

@Mapper
public interface BoardDao {
	public int insertBoard(Board board);
	public Board selectByBoardId(Long boardId);
}
