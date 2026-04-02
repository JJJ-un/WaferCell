package com.wafercell.stock.client;

import com.wafercell.global.properties.KoreaInvestProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * 해외 주식 시세 조회를 전담하는 클라이언트
 * HHDFS76200200 API를 사용하여 상세 시세(시가총액 포함)를 가져옵니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StockClient {

    private final KoreaInvestProperties properties;
    private final AuthClient authClient;
    private final RestClient restClient = RestClient.create();

    /**
     * [해외주식] 종목 상세 시세 조회 (시가총액 tomv 포함)
     */
    public Map<String, Object> getOverseasStockDetail(String exchangeCode, String ticker) {
        String accessToken = authClient.getAccessToken();

        // 상세 시세 조회를 위한 경로로 수정
        String uri = UriComponentsBuilder.fromHttpUrl(properties.getUrl())
                .path("/uapi/overseas-price/v1/quotations/price-detail")
                .queryParam("AUTH", "")       
                .queryParam("EXCD", exchangeCode)  
                .queryParam("SYMB", ticker)        
                .toUriString();

        // 해외주식 현재가 상세 조회 TR ID: HHDFS76200200
        return fetch(uri, "HHDFS76200200", accessToken);
    }

    /**
     * [해외주식] 기간별 시세 조회 (RSI 계산 등을 위한 과거 종가 데이터)
     */
    public Map<String, Object> getDailyPrice(String exchangeCode, String ticker) {
        String accessToken = authClient.getAccessToken();

        String uri = UriComponentsBuilder.fromHttpUrl(properties.getUrl())
                .path("/uapi/overseas-price/v1/quotations/dailyprice")
                .queryParam("AUTH", "")
                .queryParam("EXCD", exchangeCode)
                .queryParam("SYMB", ticker)
                .queryParam("GUBN", "0") // 0: 일봉
                .queryParam("BYMD", "")  // 공란 시 오늘 기준
                .queryParam("MODP", "1") // 수정주가 반영
                .toUriString();

        return fetch(uri, "HHDFS76240000", accessToken);
    }

    /**
     * [해외주식] 해외속보(제목) 조회 (무한 스크롤 지원)
     */
    public Map<String, Object> getOverseasBreakingNews(String lastSrno) {
        String accessToken = authClient.getAccessToken();

        String uri = UriComponentsBuilder.fromHttpUrl(properties.getUrl())
                .path("/uapi/overseas-price/v1/quotations/brknews-title")
                .queryParam("FID_NEWS_OFER_ENTP_CODE", "0") // 전체조회
                .queryParam("FID_COND_MRKT_CLS_CODE", "")
                .queryParam("FID_INPUT_ISCD", "")
                .queryParam("FID_TITL_CNTT", "")
                .queryParam("FID_INPUT_DATE_1", "")
                .queryParam("FID_INPUT_HOUR_1", "")
                .queryParam("FID_RANK_SORT_CLS_CODE", "")
                .queryParam("FID_INPUT_SRNO", lastSrno != null ? lastSrno : "") // 마지막 일련번호 전달
                .queryParam("FID_COND_SCR_DIV_CODE", "11801")
                .toUriString();

        return fetch(uri, "FHKST01011801", accessToken);
    }

    private Map<String, Object> fetch(String uri, String trId, String token) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri(uri)
                    .header("authorization", "Bearer " + token)
                    .header("appkey", properties.getKey())
                    .header("appsecret", properties.getSecret())
                    .header("tr_id", trId)
                    .header("content-type", "application/json; charset=utf-8")
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                log.error("API 응답 결과가 null입니다. TR_ID: {}", trId);
                throw new RuntimeException("API 응답을 받지 못했습니다.");
            }

            // 한국투자증권 API 표준: rt_cd가 "0"이면 성공입니다.
            String rtCd = (String) response.get("rt_cd");
            if (rtCd != null && !rtCd.equals("0")) {
                log.error("API 비정상 응답 - TR_ID: {}, rt_cd: {}, msg: {}", trId, rtCd, response.get("msg1"));
                throw new RuntimeException("API 호출 실패: " + response.get("msg1"));
            }

            return response;
        } catch (Exception e) {
            log.error("API 통신 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("한국투자증권 API 통신 실패", e);
        }
    }
}
