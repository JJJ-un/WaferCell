package com.wafercell.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wafercell.ai.client.GeminiClient;
import com.wafercell.ai.dto.AiTextResponse;
import com.wafercell.stock.service.application.StockService;
import com.wafercell.stock.dto.response.StockDailyPriceResponse;
import com.wafercell.news.service.NewsService;
import com.wafercell.news.dto.NewsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockAiService {

    private final StockService stockService; // 기존 인프라 의존성 주입
    private final NewsService newsService;   // 기존 인프라 의존성 주입[cite: 1]
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiTextResponse getCustomAnalysis(String ticker, String keyword) {
        // 1. 기존 StockService 활용하여 최근 15일치 가격 데이터 정제 수집[cite: 1]
        List<StockDailyPriceResponse> dailyPrices = stockService.getDailyPrices(ticker);
        String priceContext = dailyPrices.stream()
                .limit(15)
                .map(p -> String.format("[%s] 종가: %s, 변동률: %s%%, 거래량: %s", p.getDate(), p.getClosePrice(), p.getChangeRate(), p.getVolume()))
                .collect(Collectors.joining("\n"));

        // 2. 개선된 NewsService 활용하여 100% 매칭되는 최신 종목 뉴스 수집
        List<NewsDto> latestNews = newsService.getNewsByTicker(ticker);
        String newsContext = latestNews.stream()
                .limit(5)
                .map(n -> String.format("[%s] 기사 제목: %s\n기사 내용: %s", n.getDate(), n.getTitle(), n.getDescription()))
                .collect(Collectors.joining("\n\n"));

        if (newsContext.isEmpty()) {
            newsContext = "해당 종목에 대한 최근 주요 뉴스가 존재하지 않습니다.";
        }


// 3. 지침 프롬프트 설정 (범용적인 초보자용 일반화 버전)
        String systemInstruction = "당신은 주식 초보자를 위해 시장 데이터를 명확하고 담백하게 설명하는 전문 금융 가이드입니다.\n\n" +
                "[엄격한 규칙]\n" +
                "1. 특정 지표나 업계의 기술적 전문 용어를 원문에 그대로 사용하지 마세요.\n" +
                "2. 일상생활 속 비유, 은유, 혹은 유치한 대조 표현은 일절 금지합니다. 객관적이고 신뢰감 있는 문장만 사용하세요.\n" +
                "3. 전문 용어가 등장해야 하는 맥락에서는, 그 용어 대신 해당 지표나 수치가 내포하고 있는 실제 시장의 현상과 데이터의 의미를 쉽고 직관적인 평서문으로 풀어서 서술하세요.\n\n" +
                "반드시 제공된 JSON 스키마 구조(sections 배열)를 100% 지켜서 대답해야 합니다.";

        String userPrompt = String.format(
                "■ 분석 대상 종목: %s\n" +
                "■ 유저가 선택한 질문 주제: %s\n\n" +
                "[제공 데이터 1: 최근 일별 시세 정보]\n%s\n\n" +
                "[제공 데이터 2: 최신 뉴스 정보]\n%s\n\n" +
                "[출력 작성 가이드라인]\n" +
                "위 데이터를 정밀히 분석하여 유저가 선택한 주제에 맞는 리포트를 작성하되, 어려운 용어나 비유 없이 아래 구조로 JSON 내용을 채워주세요.\n" +
                "- title: 해당 단락의 핵심 주제를 요약한 명확한 소제목\n" +
                "- bulletPoints:\n" +
                "  1) 해당 종목의 특정 날짜(Date)의 뉴스 내용을 참고하여 확인된 객관적 사실 서술\n" +
                "  2) 해당 현상이 투자 초보자 관점에서 어떤 의미로 해석되는지 직관적인 설명 제시\n" +
                "  3) 유저가 향후 유의 깊게 관찰해야 할 리스크 요인 및 행동 지침 제안",
                ticker, keyword, priceContext, newsContext
        );

        // 4. Gemini API 호출하여 날것의 JSON String 확보
        String jsonString = geminiClient.requestAnalysis(systemInstruction, userPrompt);

        // 5. Jackson ObjectMapper를 통해 자바 DTO 객체로 최종 바인딩 매핑 후 반환
        try {
            return objectMapper.readValue(jsonString, AiTextResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 응답 객체 데이터 바인딩 실패", e);
        }
    }
}