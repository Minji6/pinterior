package com.mycompany.pinterior.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.pinterior.dao.BoardDao;
import com.mycompany.pinterior.dao.UserDao;
import com.mycompany.pinterior.dto.BoardItemResponseDto;
import com.mycompany.pinterior.dto.BoardListResponseDto;
import com.mycompany.pinterior.entity.Board;
import com.mycompany.pinterior.exception.ApiException;

import io.jsonwebtoken.lang.Arrays;

@Service
public class BoardService {
	@Autowired
	private BoardDao boardDao;
	
	// 무결성 검사를 위해 UserDao 주입
	@Autowired
	private UserDao userDao;
	
	// 보드 생성
	public Board createBoard (Board board) {
		// 보드 이름이 공란인 경우 DB 삽입 전 예외처리
		if (board.getBoardName() == null || board.getBoardName().isBlank()) {
			throw new ApiException(400, "보드 이름은 필수입니다.");
		}
		
		//DB 삽입
		boardDao.insertBoard(board);
		Board dbBoard = boardDao.selectByBoardId(board.getBoardId());
		return dbBoard;
	}
	
	// 보드 조회 (보드 ID 기준)
	public Board getBoard (Long BoardId) {
		Board board = boardDao.selectByBoardId(BoardId);
		return board;
	}
	
	// 보드 목록 조회 (유저 ID 기준)
	public List<BoardListResponseDto> getBoardList (Long userId) {
		// 유저 존재 여부 확인 (존재하지 않을 경우 404)
		if(userDao.findById(userId) == null) {
			throw new ApiException(404, "존재하지 않는 유저입니다.");
		}		
		
		// 유저 아이디에 일치하는 보드의 목록 불러오기
		List<BoardListResponseDto> boardList = boardDao.selectBoardListByUserId(userId);
		
		// (썸네일용) 핀 이미지 링크 파싱
		// 문자열로 불러와서 배열로 반환 (프론트용)
		for (BoardListResponseDto board : boardList) {
			String thumbnailStr = board.getThumbnailStr();
			if (thumbnailStr != null && !thumbnailStr.isEmpty()) {
				String[] arrays = thumbnailStr.split(",");
				board.setThumbnails(Arrays.asList(arrays));
			}
		}
		return boardList;
	}
	
	// 보드 내 핀 목록 조회 (보드 ID 기준)
	public List<BoardItemResponseDto> getBoardItem (Long boardId) {
		// 보드 존재 여부 확인 (존재하지 않을 경우 404)
		if (boardDao.selectByBoardId(boardId) == null) {
			throw new ApiException(404, "존재하지 않는 보드입니다.");
		}
		
		// 보드 아이디에 일치하는 보드의 핀 목록 불러오기
		List<BoardItemResponseDto> boardItems = boardDao.selectPinsByBoardId(boardId);
		
		return boardItems;
	}
}
