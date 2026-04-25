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
    private List<String> tickers;
}
