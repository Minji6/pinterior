package com.mycompany.pinterior.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.pinterior.dao.BoardDao;
import com.mycompany.pinterior.dao.UserDao;
import com.mycompany.pinterior.dto.BoardDetailResponseDto;
import com.mycompany.pinterior.dto.BoardItemResponseDto;
import com.mycompany.pinterior.dto.BoardListResponseDto;
import com.mycompany.pinterior.dto.BoardUpdateRequestDto;
import com.mycompany.pinterior.dto.BoardUpdateResponseDto;
import com.mycompany.pinterior.entity.Board;
import com.mycompany.pinterior.entity.SavedPin;
import com.mycompany.pinterior.exception.ApiException;

@Service
public class BoardService {
	@Autowired
	private BoardDao boardDao;

	// 무결성 검사를 위해 UserDao 주입
	@Autowired
	private UserDao userDao;

	// 보드 생성
	public Board createBoard(Board board) {
		// 보드 이름이 공란인 경우 DB 삽입 전 예외처리
		if (board.getBoardName() == null || board.getBoardName().isBlank()) {
			throw new ApiException(400, "보드 이름은 필수입니다.");
		}

		// 같은 유저의 보드 이름 중복 확인
		if (boardDao.countBoardByUserIdAndName(board.getUserId(), board.getBoardName()) > 0) {
			throw new ApiException(409, "이미 존재하는 보드 이름입니다.");
		}

		// DB 삽입
		boardDao.insertBoard(board);
		Board dbBoard = boardDao.selectByBoardId(board.getBoardId());
		return dbBoard;
	}

	// 보드 조회 (보드 ID 기준)
	public Board getBoard(Long BoardId) {
		Board board = boardDao.selectByBoardId(BoardId);
		return board;
	}

	// 보드 목록 조회 (유저 ID 기준)
	public List<BoardListResponseDto> getBoardList(Long userId) {
		// 유저 존재 여부 확인 (존재하지 않을 경우 404)
		if (userDao.findById(userId) == null) {
			throw new ApiException(404, "존재하지 않는 유저입니다.");
		}

		// 유저 아이디에 일치하는 보드의 목록 불러오기
		List<BoardListResponseDto> boardList = boardDao.selectBoardListByUserId(userId);

		// ---------------- 썸네일 부분 -----------------
		// 핀마다 쿼리를 사용하여 링크를 받아오면 N+1 문제가 발생할 수 있으므로,
		// 보드 목록을 불러올 때 saved_pin 테이블에서 해당 보드에 저장된 핀의 이미지 링크를 한 번에 불러오는 쿼리를 작성하여
		// BoardListResponseDto의 thumbnailStr 필드에 쉼표로 구분된 문자열로 저장
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
	public BoardDetailResponseDto getBoardItem(Long boardId) {
		// 보드 존재 여부 확인 (존재하지 않을 경우 404)
		Board dbBoard = boardDao.selectByBoardId(boardId);
		if (dbBoard == null) {
			throw new ApiException(404, "존재하지 않는 보드입니다.");
		}

		// 보드 아이디에 일치하는 보드의 핀 목록 불러오기
		List<BoardItemResponseDto> pins = boardDao.selectPinsByBoardId(boardId);

		// 응답 생성
		BoardDetailResponseDto response = new BoardDetailResponseDto();
		response.setBoardId(dbBoard.getBoardId());
		response.setBoardName(dbBoard.getBoardName());
		response.setBoardInfo(dbBoard.getBoardInfo());
		response.setOwnerId(dbBoard.getUserId());
		response.setPins(pins);

		return response;
	}

	// 보드 수정
	public BoardUpdateResponseDto modifyBoard(Long boardId, Long userId, BoardUpdateRequestDto request) {
		// BoardId로 보드 조회
		Board dbBoard = boardDao.selectByBoardId(boardId);

		// 보드 존재 여부 확인 (존재하지 않을 경우 404)
		if (dbBoard == null) {
			throw new ApiException(404, "존재하지 않는 보드입니다.");
		}

		// 보드 소유자 여부 확인 (로그인 사용자와 수정하려는 보드 작성자가 다를 경우 403)
		if (!dbBoard.getUserId().equals(userId)) {
			throw new ApiException(403, "해당 보드를 수정할 권한이 없습니다.");
		}

		// 보드 이름 중복 확인 (본인의 다른 보드와 중복 시 409)
		if (!dbBoard.getBoardName().equals(request.getBoardName()) &&
		    boardDao.countBoardByUserIdAndName(userId, request.getBoardName()) > 0) {
		    throw new ApiException(409, "이미 존재하는 보드 이름입니다.");
		}
		
		// 수정 데이터로 세팅
		dbBoard.setBoardName(request.getBoardName());
		dbBoard.setBoardInfo(request.getBoardInfo());

		// 보드 업데이트
		boardDao.updateBoard(dbBoard);

		// 응답 생성
		BoardUpdateResponseDto response = new BoardUpdateResponseDto();
		Board updatedBoard = boardDao.selectByBoardId(boardId);
		response.setBoardId(updatedBoard.getBoardId());
		response.setBoardName(updatedBoard.getBoardName());
		response.setBoardInfo(updatedBoard.getBoardInfo());
		response.setUpdatedAt(updatedBoard.getUpdatedAt());

		return response;

	}

	// 보드 삭제
	public void deleteBoard(Long boardId, Long userId) {
		// BoardId로 보드 조회
		Board dbBoard = boardDao.selectByBoardId(boardId);

		// 보드 존재 여부 확인
		if (dbBoard == null) {
			throw new ApiException(404, "존재하지 않는 보드입니다.");
		}

		// 보드 소유자 여부 확인
		if (!dbBoard.getUserId().equals(userId)) {
			throw new ApiException(403, "해당 보드를 삭제할 권한이 없습니다.");
		}

		// 해당 보드의 saved_pin 목록 조회
		List<SavedPin> savedPins = boardDao.selectSavedPinsByBoardId(boardId);

		// 같은 유저가 같은 핀을 여러 보드에 저장한 경우를 고려
		// 만약 기본 저장함에 이미 저장된 경우 or 다른 보드에 저장된 경우, 해당 행을 삭제
		// 하나의 보드에만 저장된 경우 ON DELETE SET NULL조건에 의해 보드 삭제 시 기본 저장함으로 이동
		for (SavedPin sp : savedPins) {
			// 동일 user_id + pin_id + board_id IS NULL 인 행이 이미 있으면 삭제
			int count = boardDao.countNullBoardSavedPin(sp.getUserId(), sp.getPinId());
			if (count > 0) {
				boardDao.deleteSavedPinById(sp.getSavedPinId());
			}
		}
		
	    // ON DELETE SET NULL이 나머지 board_id를 자동으로 null 처리
		boardDao.deleteBoard(boardId);
	}

}
