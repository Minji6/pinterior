package com.mycompany.pinterior.dao;

import com.mycompany.pinterior.entity.Users;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.Map;

@Mapper
public interface UserDao {
    // 이메일로 유저 조회 (로그인 시 비밀번호 검증용)
    Map<String, Object> findByEmail(String email);

    // userId로 유저 단건 조회 (프로필 조회용)
    Users findByUserId(Long userId);

    // userId로 유저 단건 조회 (이미지 등록/수정/삭제 시 기존 데이터 확인용)
    Users findProfileImageByUserId(@Param("userId") Long userId);

    // 프로필 이미지 업데이트 (등록/수정/삭제 공통)
    void updateProfileImage(@Param("userId") Long userId,
                            @Param("profileImgData") byte[] profileImgData,
                            @Param("profileImg") String profileImg);
}