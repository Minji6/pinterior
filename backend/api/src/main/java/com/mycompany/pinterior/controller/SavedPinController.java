package com.mycompany.pinterior.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.SavedPinCreateRequestDto;
import com.mycompany.pinterior.dto.SavedPinResponseDto;
import com.mycompany.pinterior.service.SavedPinService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/saved-pins")
public class SavedPinController {
	@Autowired
	private SavedPinService savedPinService;

	@PostMapping
	public ResponseEntity<ApiResponse<SavedPinResponseDto>> save(@Valid @RequestBody SavedPinCreateRequestDto request) {
		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		SavedPinResponseDto data = savedPinService.save(userId, request);
		return ResponseEntity.status(201).body(ApiResponse.of(201, "핀 저장 성공", data));

	}

	@DeleteMapping("/{savedPinId}")
	public ResponseEntity<ApiResponse<Void>> unsave(@PathVariable("savedPinId") Long savedPinId) {
		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		savedPinService.unsave(savedPinId, userId);
		return ResponseEntity.ok(ApiResponse.of(200, "저장 해제 성공", null));
	}

	@DeleteMapping("/{savedPinId}/board")
	public ResponseEntity<ApiResponse<Void>> removeBoardFromSavedPin(@PathVariable("savedPinId") Long savedPinId) {
		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		savedPinService.removeBoardFromSavedPin(savedPinId, userId);
		return ResponseEntity.ok(ApiResponse.of(200, "보드에서 제거 성공", null));
	}

}
