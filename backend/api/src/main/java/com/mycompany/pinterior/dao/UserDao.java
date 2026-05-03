package com.mycompany.pinterior.dao;

import com.mycompany.pinterior.dto.LoginRequestDto;
import org.apache.ibatis.annotations.Mapper;
import java.util.Map;

@Mapper
public interface UserDao {
	Map<String, Object> findByEmail(String email);
}