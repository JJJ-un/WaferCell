package com.wafercell.news.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverNewsRawResponse {
    private String lastBuildDate;
    private Integer total;
    private Integer start;
    private Integer display;
    private List<NaverNewsItem> items;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NaverNewsItem {
        private String title;
        private String originallink;
        private String link;
        private String description;
        private String pubDate;
    }
}
