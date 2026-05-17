package com.mycompany.pinterior.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.pinterior.dao.BoardDao;
import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.dao.SavedPinDao;
import com.mycompany.pinterior.dao.UserDao;
import com.mycompany.pinterior.dto.SavedPinCreateRequestDto;
import com.mycompany.pinterior.dto.SavedPinListResponseDto;
import com.mycompany.pinterior.dto.SavedPinResponseDto;
import com.mycompany.pinterior.entity.SavedPin;
import com.mycompany.pinterior.exception.ApiException;

@Service
public class SavedPinService {
	@Autowired
	private SavedPinDao savedPinDao;
	@Autowired
	private PinDao pinDao;
	@Autowired
	private UserDao userDao;
	@Autowired
	private BoardDao boardDao;
	
	//핀저장 - 김효 기능5
	public SavedPinResponseDto save(Long userId, SavedPinCreateRequestDto request) {
		Long pinId = request.getPinId();
		Long boardId = request.getBoardId();

		// 핀 존재 검증
		Long pinAuthorId = pinDao.selectUserIdByPinId(pinId);
		if (pinAuthorId == null) {
			throw new ApiException(404, "존재하지 않는 핀입니다.");
		}

		// 보드 확인 본인것인지 검증
		if (boardId != null) {
			Long boardOwnerId = savedPinDao.selectBoardOwnerByBoardId(boardId);
			if (boardOwnerId == null) {
				throw new ApiException(404, "존재하지 않는 보드입니다.");
			}
			if (!boardOwnerId.equals(userId)) {
				throw new ApiException(403, "본인 보드가 아닙니다.");
			}
		}
		
		// 중복 같은보드 저장 방지
		int duplicateCount = savedPinDao.countDuplicate(userId, pinId, boardId);
		if (duplicateCount > 0) {
			throw new ApiException(409, "이미 해당 보드에 저장된 핀입니다.");
		}

		// 저장관계 추가
		SavedPin savedPin = new SavedPin();
		savedPin.setUserId(userId);
		savedPin.setPinId(pinId);
		savedPin.setBoardId(boardId);
		savedPinDao.insert(savedPin);

		// 보드 updated_at 갱신
		if (boardId != null) {
			boardDao.updateBoardUpdatedAt(boardId);
		}

		//
		SavedPinResponseDto response = new SavedPinResponseDto();
		response.setSavedPinId(savedPin.getSavedPinId());
		response.setUserId(userId);
		response.setPinId(pinId);
		response.setBoardId(boardId);
		response.setCreatedAt(java.time.LocalDateTime.now());

		return response;

	}

	public void updateBoard(Long savedPinId, Long userId, Long boardId) {
		Long ownerId = savedPinDao.selectUserIdBySavedPinId(savedPinId);
		if (ownerId == null) {
			throw new ApiException(404, "존재하지 않는 저장입니다.");
		}
		if (!ownerId.equals(userId)) {
			throw new ApiException(403, "본인 저장만 수정할 수 있습니다.");
		}

		if (boardId != null) {
			Long boardOwnerId = savedPinDao.selectBoardOwnerByBoardId(boardId);
			if (boardOwnerId == null) {
				throw new ApiException(404, "존재하지 않는 보드입니다.");
			}
			if (!boardOwnerId.equals(userId)) {
				throw new ApiException(403, "본인 보드가 아닙니다.");
			}
		}

		savedPinDao.updateBoardBySavedPinId(savedPinId, boardId);
		// 보드 updated_at 갱신
		if (boardId != null) {
			boardDao.updateBoardUpdatedAt(boardId);
		}
	}
	
	// 저장해제 김효 - 기능 6
	public void unsave(Long savedPinId, Long userId) {
		// 저장관계 ownerid를 조회
		Long ownerId = savedPinDao.selectUserIdBySavedPinId(savedPinId);
		if (ownerId == null) {
			throw new ApiException(404, " 존재하지 않는 저장입니다.");
		}

		if (!ownerId.equals(userId)) {
			throw new ApiException(403, "본인 저장한 핀만 해제할 수 있습니다.");
		}

		savedPinDao.deleteSavedPin(savedPinId);
	}

	// 저장된 핀 조회
	public List<SavedPinListResponseDto> getSavedPinList(Long userId, Long loginUserId) {

		// 유저 존재 여부 확인 (존재하지 않을 경우 404)
		if (userDao.findById(userId) == null) {
			throw new ApiException(404, "존재하지 않는 유저입니다.");
		}

		if (!loginUserId.equals(userId)) {
			throw new ApiException(403, "해당 유저의 저장 핀을 조회할 권한이 없습니다.");
		}

		// 조회
		List<SavedPinListResponseDto> result = savedPinDao.selectSavedPinsByUserId(userId);

		return result;
	}
}
