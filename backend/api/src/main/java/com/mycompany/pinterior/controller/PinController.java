package com.mycompany.pinterior.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.pinterior.service.PinService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("api/pins")
@Slf4j
public class PinController {
	@Autowired
	private PinService pinService;
	
	@PostMapping("/")
	public 
	
}
