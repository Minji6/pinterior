package com.mycompany.pinterior.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.PinCreateRequestDto;
import com.mycompany.pinterior.dto.PinCreateResponseDto;
import com.mycompany.pinterior.dto.PinDetailResponseDto;
import com.mycompany.pinterior.dto.PinDownloadResponseDto;
import com.mycompany.pinterior.dto.PinListResponseDto;
import com.mycompany.pinterior.dto.PinSearchListResponseDto;
import com.mycompany.pinterior.dto.PinUpdateRequestDto;
import com.mycompany.pinterior.dto.PinUpdateResponseDto;
import com.mycompany.pinterior.entity.Pin;
import com.mycompany.pinterior.service.PinService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/pins")
@Slf4j
public class PinController {
	@Autowired
	private PinService pinService;
	
	@Autowired
	private PinDao pinDao;
	
	@PostMapping("")
	public ResponseEntity<ApiResponse<PinCreateResponseDto>> create(@Valid @ModelAttribute PinCreateRequestDto request,
			@RequestPart(value = "image", required = false) MultipartFile image) throws IOException {

		Pin pin = new Pin();
		
		Long userId = (Long) SecurityContextHolder
	            .getContext()
	            .getAuthentication()
	            .getPrincipal();
		pin.setUserId(userId);
		pin.setTitle(request.getTitle());
		pin.setDescription(request.getDescription());
		pin.setImageUrl(request.getImageUrl());
		pin.setLinkUrl(request.getLinkUrl());
		pin.setTags(request.getTags());

		pinService.insertPin(pin, image, request.getBoardId());

		PinCreateResponseDto data = new PinCreateResponseDto();
		data.setPinId(pin.getPinId());
		data.setUserId(pin.getUserId());
		data.setBoardId(pin.getBoardId());
		data.setImageUrl(pin.getImageUrl());
		data.setTitle(pin.getTitle());
		data.setDescription(pin.getDescription());
		data.setLinkUrl(pin.getLinkUrl());
		data.setTags(pin.getTags());
		data.setCreatedAt(pin.getCreatedAt());
		log.info("날짜 조회: ", pin.getCreatedAt());

		return ResponseEntity.status(201).body(ApiResponse.of(201, "핀 등록 성공", data));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<PinListResponseDto>> getPinList(
			@RequestParam(value = "cursor", required = false) String cursor,
			@RequestParam(value = "size", defaultValue = "20") int size) {

		PinListResponseDto data = pinService.getPinList(cursor, size);
		return ResponseEntity.ok(ApiResponse.of(200, "핀 목록 조회 성공", data));
	}

	// 핀 태그 검색
	@GetMapping("/search")
	public ResponseEntity<ApiResponse<PinSearchListResponseDto>> searchByKeyword(
			@RequestParam("tag") String tag,
			@RequestParam(value = "cursor", required = false) String cursor,
			@RequestParam(value = "size", defaultValue = "20") int size) {

		if (tag == null || tag.isBlank()) {
			return ResponseEntity.badRequest()
					.body(ApiResponse.of(400, "검색어를 입력해주세요.", null));
		}

		PinSearchListResponseDto data = pinService.searchPins(tag.trim(), cursor, size);

		// 검색 결과가 없을 때 -> 안내 메세지
		if (data.isRecommended()) {
			String message = tag.trim() + "과(와) 관련하여 저장된 핀을 찾을 수 없습니다.";
			return ResponseEntity.ok(ApiResponse.of(200, message, data));
		}

		return ResponseEntity.ok(ApiResponse.of(200, "핀 검색 성공", data));
	}

	// 상세 조회
	@GetMapping("/{pinId}")
	public ResponseEntity<ApiResponse<PinDetailResponseDto>> getPinDetail(@PathVariable("pinId") Long pinId) {

		PinDetailResponseDto data = pinService.getPinDetail(pinId);
		return ResponseEntity.ok(ApiResponse.of(200, "핀 상세 조회 성공", data));
	}

	@PutMapping("/{pinId}")
	public ResponseEntity<ApiResponse<PinUpdateResponseDto>> update(@PathVariable("pinId") Long pinId,
			@Valid @RequestBody PinUpdateRequestDto request) {

		PinUpdateResponseDto data = pinService.updatePin(pinId, request);

		return ResponseEntity.ok(ApiResponse.of(200, "핀 수정 성공", data));
	}

	// 이미지 다운로드
	@GetMapping("/{pinId}/download")
	public ResponseEntity<ApiResponse<PinDownloadResponseDto>> downdloadPin(@PathVariable("pinId") Long pinId) {
		PinDownloadResponseDto data = pinService.getDownloadUrl(pinId);
		return ResponseEntity.ok(ApiResponse.of(200, "핀 이미지 다운로드 성공", data));
	}

	// 핀 삭제
	@DeleteMapping("/{pinId}")
	public ResponseEntity<ApiResponse<Void>> deletePin(@PathVariable("pinId") Long pinId) {
		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		pinService.deletePin(pinId, userId);

		return ResponseEntity.ok(ApiResponse.of(200, "핀 삭제 성공", null));
	}
	
	// 핀 이미지 반환
	@GetMapping("/{pinId}/image")
	public ResponseEntity<byte[]> getImage(@PathVariable("pinId") Long pinId) {
	    Pin pin = pinDao.selectImageDataByPinId(pinId);
	    if (pin == null || pin.getImageData() == null) {
	        return ResponseEntity.notFound().build();
	    }
	    return ResponseEntity.ok()
	            .contentType(MediaType.IMAGE_JPEG)
	            .body(pin.getImageData());
	}
	
}