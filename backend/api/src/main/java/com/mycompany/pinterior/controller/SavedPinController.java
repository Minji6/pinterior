package com.mycompany.pinterior.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.SavedPinCreateRequestDto;
import com.mycompany.pinterior.dto.SavedPinListResponseDto;
import com.mycompany.pinterior.dto.SavedPinResponseDto;
import com.mycompany.pinterior.service.PinService;
import com.mycompany.pinterior.service.SavedPinService;
import java.util.Map;
import org.springframework.web.bind.annotation.PutMapping;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/saved-pins")
public class SavedPinController {
	@Autowired
	private SavedPinService savedPinService;
	
	@Autowired
	private PinService pinService;
	
	//핀 저장기능 - 김효 기능5
	@PostMapping
	// requestbody는 savedpincreaterequestdto
	public ResponseEntity<ApiResponse<SavedPinResponseDto>> save(@Valid @RequestBody SavedPinCreateRequestDto request) {
		// user id꺼내기
		Long userId = (Long) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();
		//서비스로 전송하기
		SavedPinResponseDto data = savedPinService.save(userId, request);
		return ResponseEntity.status(201)
				.body(ApiResponse.of(201, "핀 저장 성공", data));
		
	}
	
	@PutMapping("/{savedPinId}")
	public ResponseEntity<ApiResponse<Void>> updateBoard(@PathVariable("savedPinId") Long savedPinId,
			@RequestBody Map<String, Object> body) {
		Long userId = (Long) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();
		Object raw = body.get("boardId");
		Long boardId = raw == null ? null : Long.valueOf(raw.toString());
		savedPinService.updateBoard(savedPinId, userId, boardId);
		return ResponseEntity.ok(ApiResponse.of(200, "저장 보드 변경 성공", null));
	}
	
	// 핀 저장해제 김효 - 기능 6
	@DeleteMapping("/{savedPinId}")
	public ResponseEntity<ApiResponse<Void>> unsave(@PathVariable("savedPinId") Long savedPinId) {
		//user id 꺼내기
		Long userId = (Long) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();
		//서비스로 전송
		savedPinService.unsave(savedPinId, userId);
		return ResponseEntity.ok(ApiResponse.of(200, "저장 해제 성공", null));
	}
	

	@GetMapping("/users/{userId}")
	public ResponseEntity<ApiResponse<List<SavedPinListResponseDto>>> readSavedPin(@PathVariable("userId") Long userId) {
	    Long loginUserId = (Long) SecurityContextHolder.getContext()
	            .getAuthentication()
	            .getPrincipal();
	    List<SavedPinListResponseDto> data = savedPinService.getSavedPinList(userId, loginUserId);
	    return ResponseEntity.ok(ApiResponse.of(200, "저장된 핀 목록 조회 성공", data));
	}

}
