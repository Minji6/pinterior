package com.mycompany.pinterior.service;

import com.mycompany.pinterior.dao.UserDao;
import com.mycompany.pinterior.dto.ProfileReadResponseDto;
import com.mycompany.pinterior.entity.Users;
import com.mycompany.pinterior.exception.ApiException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileReadService {

    private final UserDao userDao;

    public ProfileReadResponseDto getProfile(Long userId) {
        Users user = userDao.findByUserId(userId);
        if (user == null) {
            throw new ApiException(404, "존재하지 않는 유저입니다.");
        }
        return ProfileReadResponseDto.from(user);
    }
}