package com.mycompany.pinterior.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.mycompany.pinterior.entity.Tag;
import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.dao.PinTagDao;
import com.mycompany.pinterior.dao.TagDao;
import com.mycompany.pinterior.entity.Pin;


import com.mycompany.pinterior.dto.PinListResponseDto;
import com.mycompany.pinterior.dto.PinSummaryDto;
import com.mycompany.pinterior.dto.AuthorDto;
import com.mycompany.pinterior.dto.PinDetailResponseDto;

import com.mycompany.pinterior.dto.PinUpdateRequestDto;
import com.mycompany.pinterior.dto.PinUpdateResponseDto;

import com.mycompany.pinterior.dto.PinDownloadResponseDto;
import com.mycompany.pinterior.exception.ApiException;
import com.mycompany.pinterior.util.CursorUtil;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;



@Service
@Slf4j
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
		    log.info("이미지 있음: {}", image.getOriginalFilename());
		    String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
		    Path savePath = Paths.get(uploadPath + fileName);
		    Files.createDirectories(savePath.getParent());
		    Files.write(savePath, image.getBytes());
		    pin.setImageUrl(uploadUrl + fileName);
		    log.info("imageUrl: {}", pin.getImageUrl());
		} else {
		    log.info("이미지 없음");
		}

		// 핀 등록
		pinDao.insert(pin);
		log.info("날짜 조회: ", pin.getCreatedAt());
		
		// DB에서 다시 조회 (createdAt 채우기)
		Pin savedPin = pinDao.selectById(pin.getPinId());
		pin.setCreatedAt(savedPin.getCreatedAt());
		
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
	public PinUpdateResponseDto updatePin(Long pinId, PinUpdateRequestDto request) {
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
		    // 핀태그 먼저삭제
		    pinDao.deletePinTagsByPinId(pinId);
		    
		    // 삭제
		    pinDao.deletePin(pinId);
		}
	}


