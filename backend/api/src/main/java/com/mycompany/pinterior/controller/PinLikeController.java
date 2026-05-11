package com.mycompany.pinterior.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.service.PinLikeService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/pins")
@Slf4j
public class PinLikeController {
	
	@Autowired
	private PinLikeService pinLikeService;
	
	// 좋아요 등록
	@PostMapping("/{pinId}/like")
	public ResponseEntity<ApiResponse<Void>> like(@PathVariable("pinId") Long pinId) {
		
		Long userId = (Long) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();
		
		pinLikeService.like(userId, pinId);
		
		return ResponseEntity.status(201).body(ApiResponse.of(201, "좋아요 성공", null));
	}
	
	// 좋아요 취소
	@DeleteMapping("/{pinId}/unlike")
	public ResponseEntity<ApiResponse<Void>> unlike(@PathVariable("pinId") Long pinId) {
		
		Long userId = (Long) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();
		
		pinLikeService.unlike(userId, pinId);
		
		return ResponseEntity.ok(ApiResponse.of(200, "좋아요 취소 성공", null));
	}
	
}
