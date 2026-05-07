package com.mycompany.pinterior.dao;

import org.apache.ibatis.annotations.Mapper;

import com.mycompany.pinterior.entity.Comment;

@Mapper
public interface CommentDao {
    // 댓글 등록
    int insert(Comment comment);
    
    // 댓글 단건 조회 (등록 후 응답용)
    Comment selectById(Long commentId);
    
    
}
