package com.mycompany.pinterior.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PinTagDao {
	int insert(@Param("pinId") int pinId, @Param("tagId") int tagId);
}
