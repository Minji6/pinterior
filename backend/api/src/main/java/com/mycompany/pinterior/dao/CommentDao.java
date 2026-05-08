package com.mycompany.pinterior.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

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
}
