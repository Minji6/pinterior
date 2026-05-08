package com.mycompany.pinterior.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.dao.SavedPinDao;
import com.mycompany.pinterior.dto.SavedPinCreateRequestDto;
import com.mycompany.pinterior.dto.SavedPinResponseDto;
import com.mycompany.pinterior.entity.SavedPin;
import com.mycompany.pinterior.exception.ApiException;

@Service
public class SavedPinService {
	@Autowired
	private SavedPinDao savedPinDao;
	@Autowired
	private PinDao pinDao;

	public SavedPinResponseDto save(Long userId, SavedPinCreateRequestDto request) {
		Long pinId = request.getPinId();
		Long boardId = request.getBoardId();

		// 핀 존재 검증
		Long pinAuthorId = pinDao.selectUserIdByPinId(pinId);
		if (pinAuthorId == null) {
			throw new ApiException(404, "존재하지 않는 핀입니다.");
		}

		// 보드 확인
		if (boardId != null) {
			Long boardOwnerId = savedPinDao.selectBoardOwnerByBoardId(boardId);
			if (boardOwnerId == null) {
				throw new ApiException(404, "존재하지 않는 보드입니다.");
			}
			if (!boardOwnerId.equals(userId)) {
				throw new ApiException(403, "본인 보드가 아닙니다.");
			}
		}

		// 중복
		int duplicateCount = savedPinDao.countDuplicate(userId, pinId, boardId);
		if (duplicateCount > 0) {
			throw new ApiException(409, "이미 해당 보드에 저장된 핀입니다.");
		}

		// 추가
		SavedPin savedPin = new SavedPin();
		savedPin.setUserId(userId);
		savedPin.setPinId(pinId);
		savedPin.setBoardId(boardId);
		savedPinDao.insert(savedPin);

		//
		SavedPinResponseDto response = new SavedPinResponseDto();
		response.setSavedPinId(savedPin.getSavedPinId());
		response.setUserId(userId);
		response.setPinId(pinId);
		response.setBoardId(boardId);
		response.setCreatedAt(java.time.LocalDateTime.now());

		return response;
		
	}

	public void unsave(Long savedPinId, Long userId) {
		Long ownerId = savedPinDao.selectUserIdBySavedPinId(savedPinId);
		if (ownerId == null) {
			throw new ApiException(404, " 존재하지 않는 저장입니다.");
		}

		if (!ownerId.equals(userId)) {
			throw new ApiException(403, "본인 저장한 핀만 해제할 수 있습니다.");
		}

		savedPinDao.deleteSavedPin(savedPinId);
	}
}
