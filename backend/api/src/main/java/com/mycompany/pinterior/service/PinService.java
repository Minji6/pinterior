package com.mycompany.pinterior.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.dto.PinListResponseDto;
import com.mycompany.pinterior.dto.PinSummaryDto;
import com.mycompany.pinterior.entity.Pin;
import com.mycompany.pinterior.util.CursorUtil;

@Service
public class PinService {
	@Autowired
	private PinDao pinDao;

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

}
