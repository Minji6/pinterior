package com.mycompany.pinterior.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.dao.PinTagDao;
import com.mycompany.pinterior.dao.TagDao;
import com.mycompany.pinterior.entity.Pin;
import com.mycompany.pinterior.entity.Tag;

import com.mycompany.pinterior.dto.PinListResponseDto;
import com.mycompany.pinterior.dto.PinSummaryDto;
import com.mycompany.pinterior.util.CursorUtil;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;



@Service
public class PinService {
	@Autowired
	private PinDao pinDao;
	@Autowired
	private TagDao tagDao;
	@Autowired
	private PinTagDao pinTagDao;

	@Value("${file.upload.path}")
	private String uploadPath;

	@Value("${file.upload.url}")
	private String uploadUrl;

	@Transactional
	public int insertPin(Pin pin, MultipartFile image) throws IOException {

		// 이미지 저장
		if (image != null && !image.isEmpty()) {
			String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
			Path savePath = Paths.get(uploadPath + fileName);
			Files.createDirectories(savePath.getParent());
			Files.write(savePath, image.getBytes());
			pin.setImageUrl(uploadUrl + fileName);
		}

		// 핀 등록
		pinDao.insert(pin);

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
		return 1;
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
