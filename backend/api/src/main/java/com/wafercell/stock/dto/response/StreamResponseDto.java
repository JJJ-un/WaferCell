package com.wafercell.stock.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StreamResponseDto {
    private String type;            // 데이터 유형 ("CALENDAR" 또는 "REALTIME_IMPACT")
    private String title;           // 카드 제목
    private String date;            // 날짜
    private Integer score;          // AI 영향도 점수 (CALENDAR의 경우 null)
    private List<String> briefing;  // AI 3줄 요약 내용 목록
    private List<String> impactedTickers; // AI 분석을 통해 영향력이 판별된 밸류체인 연관 기업 목록
}
