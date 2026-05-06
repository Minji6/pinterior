package com.mycompany.pinterior.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.pinterior.dto.PinCreateRequestDto;
import com.mycompany.pinterior.dto.PinCreateResponseDto;
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
		
		int result = pinService.insertPim(pin);
		
		PinCreateResponseDto response = new PinCreateResponseDto();
		response.setSuccess(result);
		response.setMessage(result > 0 ? "핀등록성공" : "핀등록실패");
		
		return response;
		
	}
	
	
}
