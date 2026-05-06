package com.mycompany.pinterior.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.pinterior.dto.ApiResponse;
import com.mycompany.pinterior.dto.PinCreateRequestDto;
import com.mycompany.pinterior.dto.PinCreateResponseDto;
import com.mycompany.pinterior.dto.PinListResponseDto;
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

	@PostMapping("")
	public ResponseEntity<ApiResponse<PinCreateResponseDto>> create(@Valid @RequestBody PinCreateRequestDto request) {

	    Pin pin = new Pin();
	    
	    pin.setUserId(request.getUserId());
	    pin.setTitle(request.getTitle());
	    pin.setDescription(request.getDescription());
	    pin.setImageUrl(request.getImageUrl());
	    pin.setLinkUrl(request.getLinkUrl());
	    pin.setTags(request.getTags());

	    pinService.insertPin(pin);

	    PinCreateResponseDto data = new PinCreateResponseDto();
	    data.setPinId(pin.getPinId());
	    data.setUserId(pin.getUserId());
	    data.setImageUrl(pin.getImageUrl());
	    data.setTitle(pin.getTitle());
	    data.setDescription(pin.getDescription());
	    data.setLinkUrl(pin.getLinkUrl());
	    data.setTags(pin.getTags());
	    data.setCreatedAt(pin.getCreatedAt());

	    return ResponseEntity.status(201)
	        .body(ApiResponse.of(201, "핀 등록 성공", data));
	}


	@GetMapping
	public ResponseEntity<ApiResponse<PinListResponseDto>> getPinList(
			@RequestParam(value = "cursor", required = false) String cursor,
			@RequestParam(value = "size", defaultValue = "20") int size) {

		PinListResponseDto data = pinService.getPinList(cursor, size);
		return ResponseEntity.ok(ApiResponse.of(200, "핀 목록 조회 성공", data));

	}


}
