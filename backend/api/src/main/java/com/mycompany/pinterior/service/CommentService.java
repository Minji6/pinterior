package com.mycompany.pinterior.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mycompany.pinterior.dao.CommentDao;
import com.mycompany.pinterior.dto.CommentCreateRequestDto;
import com.mycompany.pinterior.dto.CommentCreateResponseDto;
import com.mycompany.pinterior.dto.CommentListResponseDto;
import com.mycompany.pinterior.dto.CommentResponseDto;
import com.mycompany.pinterior.dto.CommentUpdateRequestDto;
import com.mycompany.pinterior.dto.CommentUpdateResponseDto;
import com.mycompany.pinterior.entity.Comment;
import com.mycompany.pinterior.exception.ApiException;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
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
        
        log.info("saved: {}", saved);
        log.info("nickname: {}", saved.getUserNickname());
        log.info("profileImg: {}", saved.getUserProfileImg());
        
        CommentCreateResponseDto data = new CommentCreateResponseDto();
        data.setCommentId(saved.getCommentId());
        data.setUserId(saved.getUserId());
        data.setPinId(saved.getPinId());
        data.setContent(saved.getCommentContent());
        data.setCreatedAt(saved.getCreatedAt());
        data.setUserNickname(saved.getUserNickname());
        data.setUserProfileImg(saved.getUserProfileImg());

        return data;
    }
    
    @Transactional
    public CommentUpdateResponseDto updateComment(Long commentId, Long userId, CommentUpdateRequestDto request) {
        // 댓글 수정
        Comment comment = new Comment();
        comment.setCommentId(commentId);
        comment.setUserId(userId);
        comment.setCommentContent(request.getContent());

        commentDao.update(comment);

        // 수정된 댓글 조회
        Comment updated = commentDao.selectById(commentId);

        CommentUpdateResponseDto data = new CommentUpdateResponseDto();
        data.setCommentId(updated.getCommentId());
        data.setContent(updated.getCommentContent());
        data.setUpdatedAt(updated.getUpdatedAt());

        return data;
    }
    
    // 댓글 삭제 
    public void deleteComment(Long commentId, Long userId) {
    	int result = commentDao.deleteById(commentId, userId);
        if (result == 0) {
            throw new ApiException(403, "삭제 권한이 없거나 존재하지 않는 댓글입니다.");
        }
    }
    
    // 댓글 조회
    public CommentListResponseDto getComments(Long pinId, int page, int size) {
        int offset = (page - 1) * size;
        
        List<CommentResponseDto> comments = commentDao.selectByPinId(pinId, offset, size);
        int total = commentDao.countByPinId(pinId);
        
        CommentListResponseDto data = new CommentListResponseDto();
        data.setComments(comments);
        data.setTotal(total);
        data.setPage(page);
        
        return data;
    }
    
}
