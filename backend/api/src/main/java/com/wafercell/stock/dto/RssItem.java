package com.wafercell.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RssItem {
    private String title;
    private String link;
    private String pubDate;
    private String source;
    private String description;
}
