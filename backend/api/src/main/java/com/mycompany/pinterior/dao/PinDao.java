package com.mycompany.pinterior.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mycompany.pinterior.entity.Pin;



@Mapper
public interface PinDao {
   public int insert(Pin pin);
   
}
