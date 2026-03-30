package com.wafercell.stock.dto;

import lombok.*;
import java.util.List;

/**
 * 해외 속보 정보를 담는 DTO (최대 10개의 연관 종목 포함)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockNewsDto {
    private String id;          // 내용조회용 일련번호 (cntt_usiq_srno)
    private String newsOferEntpCode; // 뉴스제공업체코드 (상세 조회 시 필수)
    private String date;        // 작성일자 (YYYYMMDD)
    private String time;        // 작성시간 (HHMMSS)
    private String title;       // 속보 제목
    private String source;      // 자료원 (dorg)
    private List<String> tickers; // 연관 종목 티커 리스트 (iscd1~10)
}
