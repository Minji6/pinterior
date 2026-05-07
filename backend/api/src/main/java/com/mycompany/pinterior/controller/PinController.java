package com.mycompany.pinterior.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.PinCreateRequestDto;
import com.mycompany.pinterior.dto.PinCreateResponseDto;
import com.mycompany.pinterior.dto.PinDetailResponseDto;
import com.mycompany.pinterior.dto.PinDownloadResponseDto;
import com.mycompany.pinterior.dto.PinListResponseDto;
import com.mycompany.pinterior.entity.Pin;
import com.mycompany.pinterior.service.PinService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/pins")
@Slf4j
public class PinController {
	@Autowired
	private PinService pinService;

	@PostMapping("")
	public PinCreateResponseDto create(@RequestBody PinCreateRequestDto request) {
		Pin pin = new Pin();
		pin.setTitle(request.getTitle());
		pin.setDescription(request.getDescription());
		pin.setImageUrl(request.getImageUrl());
		pin.setLinkUrl(request.getLinkUrl());

		int result = pinService.insertPin(pin);

		PinCreateResponseDto response = new PinCreateResponseDto();
		response.setSuccess(result);
		response.setMessage(result > 0 ? "핀등록성공" : "핀등록실패");

		return response;
	}

	//////
	@GetMapping
	public ResponseEntity<ApiResponse<PinListResponseDto>> getPinList(
			@RequestParam(value = "cursor", required = false) String cursor,
			@RequestParam(value = "size", defaultValue = "20") int size) {

		PinListResponseDto data = pinService.getPinList(cursor, size);
		return ResponseEntity.ok(ApiResponse.of(200, "핀 목록 조회 성공", data));
	}
	
	//상세 조회
	@GetMapping("/{pinId}")
	public ResponseEntity<ApiResponse<PinDetailResponseDto>> getPinDetail(@PathVariable("pinId") Long pinId) {

		PinDetailResponseDto data = pinService.getPinDetail(pinId);
		return ResponseEntity.ok(ApiResponse.of(200, "핀 상세 조회 성공", data));
	}
	
	//이미지 다운로드
	@GetMapping("/{pinId}/download")
	public ResponseEntity<ApiResponse<PinDownloadResponseDto>> downdloadPin(@PathVariable("pinId") Long pinId) {
		PinDownloadResponseDto data = pinService.getDownloadUrl(pinId);
		return ResponseEntity.ok(ApiResponse.of(200, "핀 이미지 다운로드 성공", data));
	}

}
