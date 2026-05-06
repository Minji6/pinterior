package com.mycompany.pinterior.dao;

import com.mycompany.pinterior.dto.LoginRequestDto;
import com.mycompany.pinterior.entity.Users;

import org.apache.ibatis.annotations.Mapper;
import java.util.Map;

@Mapper
public interface UserDao {
	Map<String, Object> findByEmail(String email);
	
	Users findByUserId(Long userId);  // 추가
}