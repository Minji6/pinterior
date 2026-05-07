package com.mycompany.pinterior.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.pinterior.dao.BoardDao;
import com.mycompany.pinterior.dto.BoardItemResponseDto;
import com.mycompany.pinterior.dto.BoardListResponseDto;
import com.mycompany.pinterior.entity.Board;

@Service
public class BoardService {
	@Autowired
	private BoardDao boardDao;
	
	public Board createBoard (Board board) {
		boardDao.insertBoard(board);
		Board dbBoard = boardDao.selectByBoardId(board.getBoardId());
		return dbBoard;
	}
	
	public Board getBoard (Long BoardId) {
		Board board = boardDao.selectByBoardId(BoardId);
		return board;
	}
	
	// 보드 목록 조회
	public List<BoardListResponseDto> getBoardList (Long userId) {
		// 유저 아이디에 일치하는 보드의 목록 불러오기
		List<BoardListResponseDto> boardList = boardDao.selectBoardListByUserId(userId);
		
		
		return boardList;
	}
	
	public List<BoardItemResponseDto> getBoardItem (Long boardId) {
		// 보드 아이디에 일치하는 보드의 핀 목록 불러오기
		List<BoardItemResponseDto> boardItems = boardDao.selectThumbnailsByBoardId(boardId);
		
		return boardItems;
	}
}
