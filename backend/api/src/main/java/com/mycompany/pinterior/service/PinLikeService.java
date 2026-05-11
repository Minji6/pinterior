package com.mycompany.pinterior.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.dao.PinLikeDao;
import com.mycompany.pinterior.exception.ApiException;

@Service
public class PinLikeService {
	
	@Autowired
	private PinLikeDao pinLikeDao;
	
	@Autowired
	private PinDao pinDao;
	
	// 좋아요 등록
	public void like(Long userId, Long pinId) {
		// 핀 존재 여부 체크
		Long authorId = pinDao.selectUserIdByPinId(pinId);
		if (authorId == null) {
			throw new ApiException(404, "존재하지 않는 핀입니다.");
		}
		
		// 중복 좋아요 체크
		int exists = pinLikeDao.countByUserIdAndPinId(userId, pinId);
		if (exists > 0) {
			throw new ApiException(409, "이미 좋아요한 핀입니다.");
		}
		
		pinLikeDao.insert(userId, pinId);
	}
	
	// 좋아요 취소
	public void unlike(Long userId, Long pinId) {
		// 핀 존재 여부 체크
		Long authorId = pinDao.selectUserIdByPinId(pinId);
		if (authorId == null) {
			throw new ApiException(404, "존재하지 않는 핀입니다.");
		}
		
		// 좋아요 안 한 상태에서 취소 시도
		int exists = pinLikeDao.countByUserIdAndPinId(userId, pinId);
		if (exists == 0) {
			throw new ApiException(400, "좋아요하지 않은 핀입니다.");
		}
		
		pinLikeDao.delete(userId, pinId);
	}
}
