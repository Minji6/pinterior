package com.mycompany.pinterior.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.CommentCreateRequestDto;
import com.mycompany.pinterior.dto.CommentCreateResponseDto;
import com.mycompany.pinterior.service.CommentService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@Slf4j
public class CommentController {
	
	@Autowired
	CommentService commentService;
	
	@PostMapping("/{pinId}/comments")
	public ResponseEntity<ApiResponse<CommentCreateResponseDto>> create(
	        @PathVariable Long pinId,
	        @Valid @RequestBody CommentCreateRequestDto request) {

	    Long userId = (Long) SecurityContextHolder
	            .getContext()
	            .getAuthentication()
	            .getPrincipal();

	    CommentCreateResponseDto data = commentService.insertComment(userId, pinId, request);

	    return ResponseEntity.status(201)
	            .body(ApiResponse.of(201, "댓글 작성 성공", data));
	}
	
}
