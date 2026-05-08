package com.mycompany.pinterior.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.BoardCreateRequestDto;
import com.mycompany.pinterior.dto.BoardCreateResponseDto;
import com.mycompany.pinterior.dto.BoardItemResponseDto;
import com.mycompany.pinterior.dto.BoardListResponseDto;
import com.mycompany.pinterior.entity.Board;
import com.mycompany.pinterior.security.JwtTokenProvider;
import com.mycompany.pinterior.service.BoardService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/boards")
@Slf4j
public class BoardController {
	@Autowired
	private BoardService boardService;
	
	@Autowired
	private JwtTokenProvider jwtTokenProvider;

	// 보드 생성하기
	@PostMapping("")
	public ResponseEntity<ApiResponse<BoardCreateResponseDto>> create(@RequestBody BoardCreateRequestDto request, 
			@RequestHeader("Authorization") String token) {
		Board board = new Board();
		
		// 생성 요청한 유저 확인		
		Long userId = jwtTokenProvider.getUserId(token.substring(7));
		
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
		
		return ResponseEntity.ok(ApiResponse.of(201, "보드 목록 조회 성공", response));
	}
	
	// 유저의 보드 목록 조회
	@GetMapping("/user/{userId}")
	public ResponseEntity<ApiResponse<List<BoardListResponseDto>>> readList (@PathVariable("userId") Long userId) {
		// 서비스를 이용해서 유저의 보드 목록 가져오기
		List<BoardListResponseDto> data = boardService.getBoardList(userId);
		
		
		return ResponseEntity.ok(ApiResponse.of(200, "보드 목록 조회 성공", data));
	}
	
	// 보드 내 핀 목록 조회
	@GetMapping("/{boardId}")
	public ResponseEntity<ApiResponse<List<BoardItemResponseDto>>> readBoardItem (@PathVariable("boardId") Long boardId) {
		// 서비스를 이용해서 보드의 핀 목록 가져오기
		List<BoardItemResponseDto> data = boardService.getBoardItem(boardId);

		return ResponseEntity.ok(ApiResponse.of(200, "보드 내 핀 목록 조회 성공", data));
	}
}
