package com.mycompany.pinterior.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mycompany.pinterior.dto.CommentResponseDto;
import com.mycompany.pinterior.entity.Comment;

@Mapper
public interface CommentDao {
	// 댓글 등록
	int insert(Comment comment);

	// 댓글 수정 후 조회 (등록 후 응답용, 등록시간정보, 유저이미지, 유저닉네임 가져오기)
	Comment selectById(Long commentId);

	// 댓글 수정
	int update(Comment comment);
	
	// 댓글 삭제
	int deleteById(@Param("commentId") Long commentId,@Param("userId") Long userId);

	// 댓글 목록 조회
	List<CommentResponseDto> selectByPinId(@Param("pinId") Long pinId, @Param("offset") int offset, @Param("size") int size);

	// 댓글 총 개수 조회
	int countByPinId(@Param("pinId") Long pinId);
	
	int deleteByPinId(@Param("pinId") Long pinId);
}
