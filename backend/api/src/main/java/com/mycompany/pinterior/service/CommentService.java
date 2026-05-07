package com.mycompany.pinterior.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mycompany.pinterior.dao.CommentDao;
import com.mycompany.pinterior.dto.CommentCreateRequestDto;
import com.mycompany.pinterior.dto.CommentCreateResponseDto;
import com.mycompany.pinterior.entity.Comment;

@Service
public class CommentService {
	
	@Autowired
    private CommentDao commentDao;

    @Transactional
    public CommentCreateResponseDto insertComment(Long userId, Long pinId, CommentCreateRequestDto request) {
        Comment comment = new Comment();
        comment.setUserId(userId);
        comment.setPinId(pinId);
        comment.setCommentContent(request.getContent());

        commentDao.insert(comment);

        // DB에서 다시 조회 (createdAt 채우기)
        Comment saved = commentDao.selectById(comment.getCommentId());

        CommentCreateResponseDto data = new CommentCreateResponseDto();
        data.setCommentId(saved.getCommentId());
        data.setUserId(saved.getUserId());
        data.setPinId(saved.getPinId());
        data.setContent(saved.getCommentContent());
        data.setCreatedAt(saved.getCreatedAt());

        return data;
    }
}
