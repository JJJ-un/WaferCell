package com.wafercell.ai.dto;

import lombok.*;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTextResponse {
    private String ticker;
    private String selectedKeyword;
    private List<AnalysisSection> sections; // 💡 마크다운 대신 구조화된 데이터 배열

    @Getter 
    @Setter 
    @NoArgsConstructor 
    @AllArgsConstructor
    public static class AnalysisSection {
        private String title;              // 소제목 (예: "1. 3월 15일 폭등 원인")
        private List<String> bulletPoints; // 해당 섹션의 하위 설명 리스트 배열
    }
}