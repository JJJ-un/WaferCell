package com.wafercell.news.client;

import com.wafercell.global.properties.NaverProperties;
import com.wafercell.news.dto.NaverNewsRawResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Component
@RequiredArgsConstructor
public class NaverNewsClient {

    private final NaverProperties properties;
    private final RestClient restClient = RestClient.create();
    private static final String NAVER_NEWS_API_URL = "https://openapi.naver.com/v1/search/news.json";

    public NaverNewsRawResponse searchNews(String query, int display, int start) {
        try {
            String uri = UriComponentsBuilder.fromHttpUrl(NAVER_NEWS_API_URL)
                    .queryParam("query", query)
                    .queryParam("display", display)
                    .queryParam("start", start)
                    .queryParam("sort", "date")
                    .build(false) // 쿼리가 이미 인코딩되어 있다면 false, 스프링 RestClient가 내부적으로 해줌
                    .toUriString();

            log.info("📡 [네이버 뉴스 API 요청] Query: {}, Display: {}, Start: {}", query, display, start);

            NaverNewsRawResponse response = restClient.get()
                    .uri(uri)
                    .header("X-Naver-Client-Id", properties.getClientId())
                    .header("X-Naver-Client-Secret", properties.getClientSecret())
                    .retrieve()
                    .body(NaverNewsRawResponse.class);

            if (response == null) {
                log.error("❌ 네이버 뉴스 응답이 null입니다. Query: {}", query);
                throw new RuntimeException("네이버 뉴스 응답을 받지 못했습니다.");
            }

            return response;
        } catch (Exception e) {
            log.error("💥 네이버 뉴스 API 통신 실패 (Query: {}): {}", query, e.getMessage(), e);
            throw new RuntimeException("네이버 뉴스 API 통신 실패", e);
        }
    }
}
