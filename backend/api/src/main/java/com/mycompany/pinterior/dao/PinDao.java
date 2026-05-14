package com.mycompany.pinterior.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mycompany.pinterior.dto.AuthorDto;
import com.mycompany.pinterior.dto.PinDetailResponseDto;
import com.mycompany.pinterior.dto.PinSearchResponseDto;
import com.mycompany.pinterior.dto.PinSummaryDto;
import com.mycompany.pinterior.entity.Pin;

@Mapper
public interface PinDao {
	// 핀 등록 
	public int insert(Pin pin);
	
	// 핀 단건 조회 
	Pin selectById(Long pinId);

	// 핀 수정 
	public int update(Pin pin);
	
	// 핀 삭제
	public int deleteByPinId(Long pinId);
	
	// ===== 전체 조회 =====

	List<PinSummaryDto> selectList(@Param("cursorId") Long cursorId, @Param("size") int size);

	//  상세 조회 
	PinDetailResponseDto selectDetail(@Param("pinId") Long pinId);

	//  작성자 조회 
	AuthorDto selectAuthorByPinId(@Param("pinId") Long pinId);

	//   태그 목록 조회 
	List<String> selectTagsByPinId(@Param("pinId") Long pinId);
	
	// 이미지 다운로드 
	String selectImageUrlByPinId(@Param("pinId") Long pinId);
	
	//  핀 작성자 조회
	Long selectUserIdByPinId(@Param("pinId") Long pinId);
	
	// 핀 태그 삭제
	int deletePinTagsByPinId(@Param("pinId") Long pinId);
	
	//  핀 삭제
	int deletePin(@Param("pinId") Long pinId);
	
	// ===== 핀 태그 검색 =====
	List<PinSearchResponseDto> searchByKeyword(
			@Param("keyword") String keyword,
			@Param("cursorId") Long cursorId,
			@Param("size") int size
	);
	
	// 좋아요 수 기준 상위 핀 조회
	List<PinSearchResponseDto> selectTopLikedPins(
		    @Param("cursorLikeCount") Long cursorLikeCount,
		    @Param("cursorPinId") Long cursorPinId,
		    @Param("size") int size
	);
	
	// 랜덤 핀 조회
	List<PinSearchResponseDto> selectRandomPins(@Param("size") int size);
	
	// 핀 blob 방식으로 넣기
	int updateImageUrl(@Param("pinId") Long pinId, @Param("imageUrl") String imageUrl);
	
	// 핀 이미지 반환
	Pin selectImageDataByPinId(Long pinId);
	
	// 내가 작성한 핀 조회
	List<PinSummaryDto> selectByUserId(Long userId);
	
}