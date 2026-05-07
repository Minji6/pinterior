package com.mycompany.pinterior.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mycompany.pinterior.entity.Tag;
import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.dao.PinTagDao;
import com.mycompany.pinterior.dao.TagDao;
import com.mycompany.pinterior.dto.PinListResponseDto;
import com.mycompany.pinterior.dto.PinSummaryDto;
import com.mycompany.pinterior.dto.PinUpdateRequestDto;
import com.mycompany.pinterior.dto.PinUpdateResponseDto;
import com.mycompany.pinterior.entity.Pin;
import com.mycompany.pinterior.util.CursorUtil;

@Service
public class PinService {
	@Autowired
	private PinDao pinDao;
	
	@Autowired
	private PinTagDao pinTagDao;
	
	@Autowired
	private TagDao tagDao;
	
	public int insertPin(Pin pin) {
		return pinDao.insert(pin);
	}

	// ===== 김효: 전체 핀 목록 조회 =====
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
	public PinUpdateResponseDto updatePin(int pinId, PinUpdateRequestDto request) {
	    Pin pin = new Pin();
	    pin.setPinId(pinId);
	    pin.setUserId(request.getUserId());
	    pin.setTitle(request.getTitle());
	    pin.setDescription(request.getDescription());
	    pin.setLinkUrl(request.getLinkUrl());
	    pin.setTags(request.getTags());

	    pinDao.update(pin);

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

	    // 수정된 핀 조회 후 DTO 반환
	    Pin updatedPin = pinDao.selectById(pinId);
	    PinUpdateResponseDto data = new PinUpdateResponseDto();
	    data.setPinId(updatedPin.getPinId());
	    data.setUserId(updatedPin.getUserId());
	    data.setTitle(updatedPin.getTitle());
	    data.setDescription(updatedPin.getDescription());
	    data.setLinkUrl(updatedPin.getLinkUrl());
	    data.setTags(updatedPin.getTags());
	    data.setUpdatedAt(updatedPin.getUpdatedAt());

	    return data;
	}
}
