package com.wafercell.stock.client;

import com.wafercell.global.properties.KoreaInvestProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * 해외 주식(미국 등) 시세 조회를 전담하는 클라이언트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StockClient {

    private final KoreaInvestProperties properties;
    private final AuthClient authClient;
    private final RestClient restClient = RestClient.create();

    /**
     * [해외주식] 종목 현재가 상세 조회 (미국 반도체 종목 등)
     * @param exchangeCode 거래소 코드 (나스닥: "NAS", 뉴욕: "NYS", 아멕스: "AMS")
     * @param ticker 종목 티커 (예: "NVDA", "TSM", "AMD")
     */
    public Map<String, Object> getOverseasStockPrice(String exchangeCode, String ticker) {
        String accessToken = authClient.getAccessToken();

        String uri = UriComponentsBuilder.fromHttpUrl(properties.getUrl())
                .path("/uapi/overseas-stock/v1/quotations/inquire-price")
                .queryParam("AUTH_CODE", "")       // 기본값 공백
                .queryParam("EXCD", exchangeCode)  // 거래소 코드
                .queryParam("SYMB", ticker)        // 종목 티커
                .toUriString();

        // 해외주식 현재가 상세 조회 TR ID: HHDFS00000300
        return fetch(uri, "HHDFS00000300", accessToken);
    }

    /**
     * 한국투자증권 해외주식 API 공통 호출 메서드
     */
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

            // 해외주식 응답에서 실제 데이터는 보통 'output' 필드에 담겨 옵니다.
            if (response == null || !response.containsKey("output")) {
                log.error("해외주식 API 응답 오류 - TR_ID: {}, URI: {}, Response: {}", trId, uri, response);
                throw new RuntimeException("해외주식 시세 데이터를 가져오지 못했습니다.");
            }

            return response;
        } catch (Exception e) {
            log.error("해외주식 API 통신 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("한국투자증권 해외주식 API 통신 실패: " + e.getMessage());
        }
    }
}
