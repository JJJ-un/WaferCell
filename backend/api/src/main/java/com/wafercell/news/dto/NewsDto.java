package com.wafercell.news.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class NewsDto {
    private String id;
    private String newsOferEntpCode;
    private String date;
    private String time;
    private String title;
    private String source;
    private String description; // 💡 AI 정밀 분석을 위한 기사 요약 설명 필드 추가
    private List<String> tickers;
    private String link;
}

