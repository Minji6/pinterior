package com.mycompany.pinterior.dto;

import java.util.List;
import lombok.Data;

@Data
public class BoardDetailResponseDto {
    private Long boardId;
    private String boardName;
    private String boardInfo;
    private Long ownerId;
    private List<BoardItemResponseDto> pins;
}