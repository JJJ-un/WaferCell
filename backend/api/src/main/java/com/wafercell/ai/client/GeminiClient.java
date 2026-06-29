package com.wafercell.ai.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.util.Map;
import java.util.List;

@Slf4j
@Component
public class GeminiClient {

    private final RestClient restClient = RestClient.create();

    @Value("${gemini.api.key}")
    private String apiKey;

    // 💡 제안 반영: 하드코딩된 구형 URL 대신 YML의 최신 주소를 동적 주입
    @Value("${gemini.api.url}")
    private String apiUrl;

    public String requestAnalysis(String systemInstruction, String userPrompt) {
        try {
            // 💡 외부 설정 URL 뒤에 API Key 쿼리 파라미터만 동적으로 결합
            String finalUrl = apiUrl + "?key=" + apiKey;

            // Structured Output을 위한 JSON 스키마 구조 정의
            Map<String, Object> jsonSchema = Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                    "ticker", Map.of("type", "STRING"),
                    "selectedKeyword", Map.of("type", "STRING"),
                    "sections", Map.of(
                        "type", "ARRAY",
                        "items", Map.of(
                            "type", "OBJECT",
                            "properties", Map.of(
                                "title", Map.of("type", "STRING"),
                                "bulletPoints", Map.of("type", "ARRAY", "items", Map.of("type", "STRING"))
                            ),
                            "required", List.of("title", "bulletPoints")
                        )
                    )
                ),
                "required", List.of("ticker", "selectedKeyword", "sections")
            );

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", userPrompt)))),
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                "generationConfig", Map.of(
                    "responseMimeType", "application/json",
                    "responseSchema", jsonSchema
                )
            );

            // 최종 동적 URL로 전송
            String rawResponse = restClient.post()
                    .uri(finalUrl)
                    .body(requestBody)
                    .header("Content-Type", "application/json")
                    .retrieve()
                    .body(String.class);

            return new com.fasterxml.jackson.databind.ObjectMapper().readTree(rawResponse)
                    .path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            // 🔥 [수정] 로그를 상세히 찍고, 예외를 그대로 밖으로 던져서 숨기지 않습니다.
            log.error("💥 Gemini API 통신 중 진짜 에러 발생 원인: {}", e.getMessage(), e);
            throw new RuntimeException("Gemini 처리 실패 원인: " + e.getMessage(), e);
        }
    }

    public String requestStreamAnalysis(String systemInstruction, String userPrompt) {
        try {
            String finalUrl = apiUrl + "?key=" + apiKey;

            // StreamResponseDto 바인딩을 위한 전용 JSON 스키마 구조 정의
            Map<String, Object> jsonSchema = Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                    "title", Map.of("type", "STRING"),
                    "score", Map.of("type", "INTEGER"),
                    "briefing", Map.of(
                        "type", "ARRAY",
                        "items", Map.of("type", "STRING")
                    )
                ),
                "required", List.of("title", "score", "briefing")
            );

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", userPrompt)))),
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                "generationConfig", Map.of(
                    "responseMimeType", "application/json",
                    "responseSchema", jsonSchema
                )
            );

            String rawResponse = restClient.post()
                    .uri(finalUrl)
                    .body(requestBody)
                    .header("Content-Type", "application/json")
                    .retrieve()
                    .body(String.class);

            return new com.fasterxml.jackson.databind.ObjectMapper().readTree(rawResponse)
                    .path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            log.error("💥 Gemini API 실시간 뉴스 분석 통신 에러: {}", e.getMessage(), e);
            throw new RuntimeException("Gemini 실시간 분석 실패: " + e.getMessage(), e);
        }
    }
}