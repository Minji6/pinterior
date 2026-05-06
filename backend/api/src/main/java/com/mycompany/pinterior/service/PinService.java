package com.mycompany.pinterior.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.entity.Pin;

@Service
public class PinService {
	@Autowired
	private PinDao pinDao;
	
	public int insertPim(Pin pin) {
		return pinDao.insert(pin);
	}
	
}
