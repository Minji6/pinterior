package com.mycompany.pinterior.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.dto.AuthorDto;
import com.mycompany.pinterior.dto.PinDetailResponseDto;
import com.mycompany.pinterior.dto.PinDownloadResponseDto;
import com.mycompany.pinterior.dto.PinListResponseDto;
import com.mycompany.pinterior.dto.PinSummaryDto;
import com.mycompany.pinterior.entity.Pin;
import com.mycompany.pinterior.exception.ApiException;
import com.mycompany.pinterior.util.CursorUtil;

@Service
public class PinService {
	@Autowired
	private PinDao pinDao;

	public int insertPin(Pin pin) {
		return pinDao.insert(pin);
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

		// 임시 값
		detail.setLikeCount(0);
		detail.setLiked(false);
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
}
