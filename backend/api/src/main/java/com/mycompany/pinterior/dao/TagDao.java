package com.mycompany.pinterior.dao;

import org.apache.ibatis.annotations.Mapper;

import com.mycompany.pinterior.entity.Tag;

@Mapper
public interface TagDao {
	// 태그 이름으로 조횡
	Tag selectByTagName(String tagname);
	
	// 태그 insert
	int insert(Tag tag);
}
