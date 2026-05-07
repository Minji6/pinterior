package com.mycompany.pinterior.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PinTagDao {
	int insert(@Param("pinId") Long pinId, @Param("tagId") Long tagId);
	
	public int deleteByPinId(Long pinId);
}
