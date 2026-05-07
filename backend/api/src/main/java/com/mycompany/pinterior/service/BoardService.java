package com.mycompany.pinterior.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.pinterior.dao.BoardDao;
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
	
}
