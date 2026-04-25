package com.wafercell.stock.client;

import com.wafercell.global.properties.KoreaInvestProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * 한국투자증권 API 통신을 위한 공통 기능을 담은 추상 클래스
 */
@Slf4j
@RequiredArgsConstructor
public abstract class AbstractKoreaInvestClient {

    protected final KoreaInvestProperties properties;
    protected final AuthClient authClient;
    protected final RestClient restClient = RestClient.create();

    /**
     * URI 생성 공통 메서드
     */
    protected String createUri(String path, Map<String, String> queryParams) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(properties.getUrl()).path(path);
        queryParams.forEach(builder::queryParam);
        return builder.toUriString();
    }

    /**
     * API 호출 및 공통 에러 처리 메서드 (External DTO 기반)
     */
    protected <T> T fetch(String uri, String trId, String token, ParameterizedTypeReference<T> responseType) {
        try {
            T response = restClient.get()
                    .uri(uri)
                    .header("authorization", "Bearer " + token)
                    .header("appkey", properties.getKey())
                    .header("appsecret", properties.getSecret())
                    .header("tr_id", trId)
                    .header("content-type", "application/json; charset=utf-8")
                    .retrieve()
                    .body(responseType);

            if (response == null) {
                log.error("API 응답 결과가 null입니다. TR_ID: {}", trId);
                throw new RuntimeException("API 응답을 받지 못했습니다.");
            }

            return response;
        } catch (Exception e) {
            log.error("API 통신 중 오류 발생 (TR_ID: {}): {}", trId, e.getMessage());
            throw new RuntimeException("한국투자증권 API 통신 실패", e);
        }
    }
}
