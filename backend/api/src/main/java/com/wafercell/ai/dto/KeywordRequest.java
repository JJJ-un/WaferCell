package com.wafercell.ai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KeywordRequest {
    // 리액트에서 클릭한 키워드 태그 텍스트 (예: "최근 폭등일 원인 분석")
    private String keyword; 
}