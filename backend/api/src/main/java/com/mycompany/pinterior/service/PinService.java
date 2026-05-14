package com.mycompany.pinterior.service;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.dao.PinLikeDao;
import com.mycompany.pinterior.dao.PinTagDao;
import com.mycompany.pinterior.dao.SavedPinDao;
import com.mycompany.pinterior.dao.TagDao;
import com.mycompany.pinterior.dto.AuthorDto;
import com.mycompany.pinterior.dto.PinDetailResponseDto;
import com.mycompany.pinterior.dto.PinDownloadResponseDto;
import com.mycompany.pinterior.dto.PinListResponseDto;
import com.mycompany.pinterior.dto.PinSearchListResponseDto;
import com.mycompany.pinterior.dto.PinSearchResponseDto;
import com.mycompany.pinterior.dto.PinSummaryDto;
import com.mycompany.pinterior.dto.PinUpdateRequestDto;
import com.mycompany.pinterior.dto.PinUpdateResponseDto;
import com.mycompany.pinterior.entity.Pin;
import com.mycompany.pinterior.entity.SavedPin;
import com.mycompany.pinterior.entity.Tag;
import com.mycompany.pinterior.exception.ApiException;
import com.mycompany.pinterior.util.CursorUtil;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PinService {
	@Autowired
	private PinDao pinDao;
	@Autowired
	private TagDao tagDao;
	@Autowired
	private PinTagDao pinTagDao;
	@Autowired
	private SavedPinDao savedPinDao;
	@Autowired
	private PinLikeDao pinLikeDao;

	@Value("${file.upload.path}")
	private String uploadPath;

	@Value("${file.upload.url}")
	private String uploadUrl;

	@Transactional
	public void insertPin(Pin pin, MultipartFile image, Long boardId) throws IOException {
		log.info("boardId: {}", boardId);
		// 이미지 저장
		if (image != null && !image.isEmpty()) {
		    byte[] imageBytes;
		    try {
		        imageBytes = image.getBytes();
		    } catch (IOException e) {
		        throw new ApiException(500, "서버 에러가 발생했습니다.");
		    }
		    pin.setImageData(imageBytes);
		}

		// 핀 등록 (여기서 pinId가 채워짐)
		pinDao.insert(pin);

		// insert 후에 pinId로 URL 세팅
		if (pin.getImageData() != null) {
		    String imageUrl = "/api/pins/" + pin.getPinId() + "/image";
		    pin.setImageUrl(imageUrl);
		    pinDao.updateImageUrl(pin.getPinId(), imageUrl);
		}
		log.info("날짜 조회: ", pin.getCreatedAt());

		// DB에서 다시 조회 (createdAt 채우기)
		Pin savedPin = pinDao.selectById(pin.getPinId());
		pin.setCreatedAt(savedPin.getCreatedAt());

		// 보드 선택했으면 saved_pin에 저장
		if (boardId != null) {
			// 보드 소유자 확인
			Long boardOwner = savedPinDao.selectBoardOwnerByBoardId(boardId);
			if (boardOwner == null || !boardOwner.equals(pin.getUserId())) {
				throw new ApiException(403, "본인 보드에만 저장할 수 있습니다.");
			}

			// 중복 저장 확인
			int duplicate = savedPinDao.countDuplicate(pin.getUserId(), pin.getPinId(), boardId);
			if (duplicate > 0) {
				throw new ApiException(409, "이미 해당 보드에 저장된 핀입니다.");
			}

			SavedPin newSavedPin = new SavedPin();
			newSavedPin.setPinId(pin.getPinId());
			newSavedPin.setBoardId(boardId);
			newSavedPin.setUserId(pin.getUserId());
			savedPinDao.insert(newSavedPin);

			// 다시 조회해서 boardId 채우기
			SavedPin saved = savedPinDao.selectByPinId(pin.getPinId());
			pin.setBoardId(saved.getBoardId());
		}

		// 태그 등록
		if (pin.getTags() != null && !pin.getTags().isEmpty()) {
			for (String tagName : pin.getTags()) {
				Tag tag = tagDao.selectByTagName(tagName);
				if (tag == null) {
					tag = new Tag();
					tag.setTagName(tagName);
					tagDao.insert(tag);
				}
				pinTagDao.insert(pin.getPinId(), tag.getTagId());
			}
		}
	}

	// ===== 전체 핀 조회 =====
	public PinListResponseDto getPinList(String cursor, int size) {
		Long cursorId = CursorUtil.decode(cursor);

		List<PinSummaryDto> pins = pinDao.selectList(cursorId, size + 1);

		boolean hasNext = pins.size() > size;

		if (hasNext) {
			pins = pins.subList(0, size);
		}

		String nextCursor = null;
		if (hasNext && !pins.isEmpty()) {
			Long lastPinId = pins.get(pins.size() - 1).getPinId();
			nextCursor = CursorUtil.encode(lastPinId);
		}

		return new PinListResponseDto(pins, nextCursor, hasNext);
	}

	@Transactional
	public PinUpdateResponseDto updatePin(Long pinId, Long userId, PinUpdateRequestDto request) {
		Pin pin = new Pin();
		pin.setPinId(pinId);
		pin.setUserId(userId);
		pin.setTitle(request.getTitle());
		pin.setDescription(request.getDescription());
		pin.setLinkUrl(request.getLinkUrl());
		pin.setTags(request.getTags());
		pin.setBoardId(request.getBoardId());
		pinDao.update(pin);
		
		// 보드 변경
		if (request.getBoardId() != null) {
		    savedPinDao.updateBoardId(pinId, userId, request.getBoardId());
		}
		
		// 기존 태그 연결 삭제
		pinTagDao.deleteByPinId(pinId);

		// 태그 재등록
		if (pin.getTags() != null && !pin.getTags().isEmpty()) {
			for (String tagName : pin.getTags()) {
				Tag tag = tagDao.selectByTagName(tagName);
				if (tag == null) {
					tag = new Tag();
					tag.setTagName(tagName);
					tagDao.insert(tag);
				}
				pinTagDao.insert(pin.getPinId(), tag.getTagId());
			}
		}
		
		// 태그 조회
		List<String> tags = pinDao.selectTagsByPinId(pinId);
		
		
		// 수정된 핀 조회 후 DTO 반환
		Pin updatedPin = pinDao.selectById(pinId);
		PinUpdateResponseDto data = new PinUpdateResponseDto();
		data.setPinId(updatedPin.getPinId());
		data.setUserId(updatedPin.getUserId());
		data.setTitle(updatedPin.getTitle());
		data.setDescription(updatedPin.getDescription());
		data.setLinkUrl(updatedPin.getLinkUrl());
		data.setTags(tags);
		data.setUpdatedAt(updatedPin.getUpdatedAt());
		SavedPin savedPin = savedPinDao.selectByPinId(pinId);
		data.setBoardId(savedPin != null ? savedPin.getBoardId() : null);
	
		return data;
	}

	//
	//
	public PinDetailResponseDto getPinDetail(Long pinId) {

		PinDetailResponseDto detail = pinDao.selectDetail(pinId);
		if (detail == null) {
			throw new ApiException(404, "존재하지 않는 핀입니다.");
		}

		AuthorDto author = pinDao.selectAuthorByPinId(pinId);
		detail.setAuthor(author);

		List<String> tags = pinDao.selectTagsByPinId(pinId);
		detail.setTags(tags);

		// 좋아요 수, 좋아요 여부
		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		int likeCount = pinLikeDao.countByPinId(pinId);
		boolean isLiked = pinLikeDao.countByUserIdAndPinId(userId, pinId) > 0;

		detail.setLikeCount(likeCount);
		detail.setLiked(isLiked);

		// 댓글 허용 여부는 추후 구현 예정
		detail.setCommentEnabled(1);

		return detail;

	}

	// 이미지 다운로드
	public PinDownloadResponseDto getDownloadUrl(Long pinId) {
		String imageUrl = pinDao.selectImageUrlByPinId(pinId);
		if (imageUrl == null) {
			throw new ApiException(404, "이미지를 찾을 수 없습니다.");
		}

		return new PinDownloadResponseDto(imageUrl);
	}

	// 핀 삭제
	public void deletePin(Long pinId, Long userId) {
		Long authorId = pinDao.selectUserIdByPinId(pinId);
		if (authorId == null) {
			throw new ApiException(404, "존재하지 않는 핀입니다.");
		}

		// 권한 본인 삭제 가능
		if (!authorId.equals(userId)) {
			throw new ApiException(403, "본인 핀만 삭제할 수 있습니다.");
		}

		// 핀 좋아요 삭제
		pinLikeDao.deleteByPinId(pinId);

		// 핀태그 먼저삭제
		pinDao.deletePinTagsByPinId(pinId);

		// 삭제
		pinDao.deletePin(pinId);

	}


	// 핀 태그 검색
	public PinSearchListResponseDto searchPins(String keyword, String cursor, int size) {

		// RANDOM 체크를 decode보다 먼저 수행
		if ("RANDOM".equals(cursor)) {
			List<PinSearchResponseDto> randomPins = pinDao.selectRandomPins(size);
			convertTags(randomPins);
			return new PinSearchListResponseDto(randomPins, null, false, true);
		}

		Long cursorId = CursorUtil.decode(cursor);

		List<PinSearchResponseDto> pins = pinDao.searchByKeyword(keyword, cursorId, size + 1);

		boolean hasNext = pins.size() > size;
		if (hasNext) {
			pins = pins.subList(0, size);
		}

		convertTags(pins);

		// 검색 결과 있을 때
		if (!pins.isEmpty()) {
			String nextCursor = null;
			if (hasNext) {
				nextCursor = CursorUtil.encode(pins.get(pins.size() - 1).getPinId());
			}
			return new PinSearchListResponseDto(pins, nextCursor, hasNext, false);
		}

		// 검색 결과 없을 때 → 좋아요 순 페이징
		long[] likedCursor = CursorUtil.decodeLike(cursor);
		Long cursorLikeCount = likedCursor != null ? likedCursor[0] : null;
		Long cursorPinId = likedCursor != null ? likedCursor[1] : null;

		List<PinSearchResponseDto> topLikedPins = pinDao.selectTopLikedPins(cursorLikeCount, cursorPinId, size + 1);

		boolean likedHasNext = topLikedPins.size() > size;
		if (likedHasNext) {
			topLikedPins = topLikedPins.subList(0, size);
		}

		convertTags(topLikedPins);

		if (!likedHasNext) {
			return new PinSearchListResponseDto(topLikedPins, "RANDOM", true, true);
		}

		PinSearchResponseDto last = topLikedPins.get(topLikedPins.size() - 1);
		String nextCursor = CursorUtil.encodeLike(last.getLikeCount(), last.getPinId());
		return new PinSearchListResponseDto(topLikedPins, nextCursor, true, true);
	}

	// 태그 문자열 → 리스트 변환 공통 메서드
	private void convertTags(List<PinSearchResponseDto> pins) {
		for (PinSearchResponseDto pin : pins) {
			if (pin.getTags() != null && !pin.getTags().isEmpty()) {
				pin.setTagList(Arrays.asList(pin.getTags().split(",")));
			} else {
				pin.setTagList(Collections.emptyList());
			}
		}
	}
	
	// 내가 작성한 핀 조회
	public List<PinSummaryDto> getPinListByUserId(Long userId) {
		return pinDao.selectByUserId(userId);
	}
}


