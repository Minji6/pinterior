package com.mycompany.pinterior.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.BoardCreateRequestDto;
import com.mycompany.pinterior.dto.BoardCreateResponseDto;
import com.mycompany.pinterior.dto.BoardDetailResponseDto;
import com.mycompany.pinterior.dto.BoardListResponseDto;
import com.mycompany.pinterior.dto.BoardUpdateRequestDto;
import com.mycompany.pinterior.dto.BoardUpdateResponseDto;
import com.mycompany.pinterior.entity.Board;
import com.mycompany.pinterior.service.BoardService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/boards")
@Slf4j
public class BoardController {
	@Autowired
	private BoardService boardService;

	// 보드 생성하기
	@PostMapping("")
	public ResponseEntity<ApiResponse<BoardCreateResponseDto>> create(
			@RequestBody @Valid BoardCreateRequestDto request) {
		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		Board board = new Board();
		// 보드 생성 요청 확인
		board.setBoardName(request.getBoardName());
		board.setBoardInfo(request.getBoardInfo());
		board.setUserId(userId);

		// 서비스 로직 호출
		Board dbBoard = boardService.createBoard(board);

		// 응답 생성
		BoardCreateResponseDto response = new BoardCreateResponseDto();
		response.setBoardId(dbBoard.getBoardId());
		response.setUserId(userId);
		response.setBoardName(dbBoard.getBoardName());
		response.setBoardInfo(dbBoard.getBoardInfo());
		response.setCreatedAt(dbBoard.getCreatedAt());
		response.setUpdatedAt(dbBoard.getUpdatedAt());

		return ResponseEntity.ok(ApiResponse.of(201, "보드 생성 성공", response));
	}
	
	// 유저의 보드 목록 조회
	@GetMapping("/user/{userId}")
	public ResponseEntity<ApiResponse<List<BoardListResponseDto>>> readList(@PathVariable("userId") Long userId) {
		// 서비스를 이용해서 유저의 보드 목록 가져오기
		List<BoardListResponseDto> data = boardService.getBoardList(userId);
		return ResponseEntity.ok(ApiResponse.of(200, "보드 목록 조회 성공", data));
	}

	// 보드 내 핀 목록 조회
	@GetMapping("/{boardId}")
	public ResponseEntity<ApiResponse<BoardDetailResponseDto>> readBoardItem(
			@PathVariable("boardId") Long boardId) {
		// 서비스를 이용해서 보드의 핀 목록 가져오기
		BoardDetailResponseDto data = boardService.getBoardItem(boardId);
		return ResponseEntity.ok(ApiResponse.of(200, "보드 내 핀 목록 조회 성공", data));
	}

	// 보드 수정
	@PutMapping("/{boardId}")
	public ResponseEntity<ApiResponse<BoardUpdateResponseDto>> updateBoard(@PathVariable("boardId") Long boardId,
			@RequestBody @Valid BoardUpdateRequestDto request) {
		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		BoardUpdateResponseDto response = boardService.modifyBoard(boardId, userId, request);

		return ResponseEntity.ok(ApiResponse.of(200, "보드 수정 성공", response));

	}

	// 보드 삭제
	@DeleteMapping("/{boardId}")
	public ResponseEntity<ApiResponse<Void>> deleteBoard (@PathVariable("boardId") Long boardId,
			@RequestHeader("Authorization") String token) {
		
		// 생성 요청한 유저 확인		
		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		
		boardService.deleteBoard(boardId, userId);
		
		return ResponseEntity.ok(ApiResponse.of(200, "보드 삭제 성공", null));
		
	}
	
}
