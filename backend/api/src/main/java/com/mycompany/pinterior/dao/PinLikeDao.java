package com.mycompany.pinterior.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PinLikeDao {

    // 좋아요 등록
    int insert(@Param("userId") Long userId, @Param("pinId") Long pinId);

    // 좋아요 취소
    int delete(@Param("userId") Long userId, @Param("pinId") Long pinId);

    // 중복 좋아요 체크 (1이면 이미 좋아요한 상태)
    int countByUserIdAndPinId(@Param("userId") Long userId, @Param("pinId") Long pinId);

    // 핀의 총 좋아요 수
    int countByPinId(@Param("pinId") Long pinId);
    
    // 핀 삭제 시 연관 좋아요 전체 삭제
    int deleteByPinId(@Param("pinId") Long pinId);
}