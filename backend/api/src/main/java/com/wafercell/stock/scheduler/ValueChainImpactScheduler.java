package com.wafercell.stock.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wafercell.ai.client.GeminiClient;
import com.wafercell.stock.client.GoogleNewsRssClient;
import com.wafercell.stock.dto.RssItem;
import com.wafercell.stock.dto.response.StreamResponseDto;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.entity.StockSupplyChainEvent;
import com.wafercell.stock.repository.StockRepository;
import com.wafercell.stock.repository.StockSupplyChainEventRepository;
import com.wafercell.stock.service.application.ValueChainStreamService;
import com.wafercell.stock.service.application.OverseasInformationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ValueChainImpactScheduler {

    private final ValueChainStreamService streamService;
    private final OverseasInformationService overseasInformationService;
    private final GeminiClient geminiClient;
    private final StockRepository stockRepository;
    private final StockSupplyChainEventRepository eventRepository;
    private final GoogleNewsRssClient googleNewsRssClient;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Scheduled(cron = "0 */1 * * * *") // 매 1분마다 주기적으로 실행합니다.
    public void monitorAndAnalyzeNews() {
        List<Stock> stocks = stockRepository.findAll();
        if (stocks.isEmpty()) {
            return;
        }

        log.info("⏰ [실시간 밸류체인 해외 공시/속보 분석] 스케줄러 가동. 감시 대상 종목 수: {}", stocks.size());

        // 1단계: SEC 기업 공시 감시 및 전파
        monitorCorporateFilings(stocks);

        // 2단계: 글로벌 속보 뉴스 감시 및 전파
        monitorFinancialNews(stocks);

        log.info("⏰ [실시간 밸류체인 해외 공시/속보 분석] 스케줄러 가동 완료.");
    }

    /**
     * 1단계: SEC 수시 공시(8-K, 10-Q 등) 감시 및 전파
     */
    private void monitorCorporateFilings(List<Stock> stocks) {
        for (Stock stock : stocks) {
            String ticker = stock.getTicker().trim().toUpperCase();
            try {
                // 1. 최신 공시 URL 획득 (메타 JSON만 조회하므로 매우 가벼움)
                String docUrl = overseasInformationService.getLatestFilingUrl(ticker);
                if (docUrl == null || docUrl.trim().isEmpty()) {
                    continue;
                }

                // 2. 글로벌 중복 검사: 해당 공시 URL이 이미 분석된 기록이 있는지 확인
                boolean exists = eventRepository.existsByNewsUrlAndEventType(docUrl, "REALTIME_IMPACT");
                if (exists) {
                    continue; // 이미 과거 주기에 분석되어 관련 종목에 모두 적재/전파되었으므로 스킵
                }

                log.info("📢 [신규 SEC 공시 감지] 종목: {}, 주소: {}", ticker, docUrl);

                // 3. 실제 공시 본문 다운로드 및 정제 (신규 공시일 때만 딱 1회 네트워크 다운로드)
                String filingText = overseasInformationService.fetchFilingTextByUrl(docUrl);
                if (filingText == null || filingText.trim().isEmpty()) {
                    continue;
                }

                // 4. Gemini AI 분석용 지시문 및 사용자 프롬프트 작성
                String systemInstruction = "당신은 글로벌 IT/반도체 공급망 및 주가 영향 분석 전문가입니다.\n" +
                        "제공된 기업 공시(SEC Filing)가 해당 종목 및 관련 밸류체인 기업들의 주가에 미칠 단기적 파급력 영향도 점수(-5점에서 +5점 사이의 정수)를 채점하세요. (강력한 악재 -5, 영향 없음 0, 강력한 호재 +5)\n" +
                        "또한, 그 원인과 주가에 미칠 영향을 한국 주식 투자자가 직관적으로 이해할 수 있는 한글 3줄 분석 브리핑 목록으로 요약해 주세요.\n" +
                        "특히, 해당 공시 영향 분석 결과에 따라 직접적으로 주가 파급 효과가 예상되는 밸류체인 내의 연관 반도체 종목 티커 목록(11개 기본 종목인 NVDA, AMD, AVGO, QCOM, ARM, TSM, ASML, AMAT, LRCX, MU, INTC 중 관련 있는 종목들)을 추출하여 impactedTickers 배열에 담으세요. 분석 대상 종목 자신(예: " + ticker + ")은 기본적으로 목록에 포함해야 합니다.\n" +
                        "반드시 제공되는 JSON 스키마 규격만 충족하여 답변해야 합니다.";

                String userPrompt = String.format("■ 분석 대상 종목: %s\n\n[수집된 최신 SEC 공시 원문 발췌]\n%s", ticker, filingText);

                // 5. 제미나이 AI 호출
                String jsonResult = geminiClient.requestStreamAnalysis(systemInstruction, userPrompt);
                StreamResponseDto responseDto = objectMapper.readValue(jsonResult, StreamResponseDto.class);
                responseDto.setType("REALTIME_IMPACT");
                responseDto.setDate(LocalDate.now().format(DATE_FORMATTER));

                // 6. 점수 기준 필터링 및 단일 저장
                if (Math.abs(responseDto.getScore()) >= 3) {
                    processAndSave(ticker, docUrl, responseDto);
                }

            } catch (Exception e) {
                log.error("💥 [{}] 종목 SEC 공시 분석 중 에러 발생: {}", ticker, e.getMessage(), e);
            }
        }
    }

    /**
     * 2단계: 글로벌 금융 속보 뉴스 감시 및 전파
     */
    private void monitorFinancialNews(List<Stock> stocks) {
        // 1. 모든 종목의 RSS 피드를 조회해 메모리에서 URL 기준으로 중복 제거
        Map<String, RssItem> uniqueNewsMap = new HashMap<>();
        for (Stock stock : stocks) {
            String ticker = stock.getTicker().trim().toUpperCase();
            try {
                List<RssItem> rssItems = googleNewsRssClient.fetchNewsRss(ticker);
                for (RssItem item : rssItems) {
                    if (item.getLink() != null && !item.getLink().trim().isEmpty()) {
                        uniqueNewsMap.put(item.getLink().trim(), item);
                    }
                }
            } catch (Exception e) {
                log.warn("⚠️ [{}] 종목 RSS 수집 실패: {}", ticker, e.getMessage());
            }
        }

        if (uniqueNewsMap.isEmpty()) {
            return;
        }

        // 2. 유니크 기사 목록 순회 분석
        for (Map.Entry<String, RssItem> entry : uniqueNewsMap.entrySet()) {
            String newsUrl = entry.getKey();
            RssItem item = entry.getValue();

            try {
                // 3. 글로벌 중복 검사: 해당 기사 URL이 이미 분석된 기록이 있는지 확인
                boolean exists = eventRepository.existsByNewsUrlAndEventType(newsUrl, "REALTIME_IMPACT");
                if (exists) {
                    continue; // 이미 과거 주기에 분석되어 관련 종목에 모두 적재/전파되었으므로 스킵
                }

                log.info("📢 [신규 속보 뉴스 감지] 제목: {}, 주소: {}", item.getTitle(), newsUrl);

                // 4. 실제 본문 긁어오기 (신규 기사일 때만 딱 1회 네트워크 호출)
                String articleBody = overseasInformationService.fetchArticleBody(newsUrl);
                if (articleBody == null || articleBody.trim().isEmpty()) {
                    articleBody = "(본문 수집 불가능. 기사 제목 정보로 분석 요망)";
                }

                // 5. Gemini AI 분석용 RAG 문맥 및 프롬프트 조립
                String context = String.format("기사 제목: %s\n출처 언론사: %s\n발행 날짜: %s\n기사 본문 내용:\n%s\n",
                        item.getTitle(), item.getSource(), item.getPubDate(), articleBody);

                String systemInstruction = "당신은 글로벌 IT/반도체 공급망 및 주가 영향 분석 전문가입니다.\n" +
                        "제공된 뉴스 기사가 해당 종목 및 관련 밸류체인 기업들의 주가에 미칠 단기적 파급력 영향도 점수(-5점에서 +5점 사이의 정수)를 채점하세요. (강력한 악재 -5, 영향 없음 0, 강력한 호재 +5)\n" +
                        "또한, 그 원인과 주가에 미칠 영향을 한국 주식 투자자가 직관적으로 이해할 수 있는 한글 3줄 분석 브리핑 목록으로 요약해 주세요.\n" +
                        "특히, 해당 뉴스 영향 분석 결과에 따라 직접적으로 주가 파급 효과가 예상되는 밸류체인 내의 연관 반도체 종목 티커 목록(11개 기본 종목인 NVDA, AMD, AVGO, QCOM, ARM, TSM, ASML, AMAT, LRCX, MU, INTC 중 관련 있는 종목들)을 추출하여 impactedTickers 배열에 담으세요.\n" +
                        "반드시 제공되는 JSON 스키마 규격만 충족하여 답변해야 합니다.";

                String userPrompt = String.format("[수집된 신규 속보 뉴스]\n%s", context);

                // 6. 제미나이 AI 호출
                String jsonResult = geminiClient.requestStreamAnalysis(systemInstruction, userPrompt);
                StreamResponseDto responseDto = objectMapper.readValue(jsonResult, StreamResponseDto.class);
                responseDto.setType("REALTIME_IMPACT");
                responseDto.setDate(LocalDate.now().format(DATE_FORMATTER));

                // 7. 점수 기준 필터링 및 단일 저장
                if (Math.abs(responseDto.getScore()) >= 3) {
                    processAndSave(null, newsUrl, responseDto);
                }

            } catch (Exception e) {
                log.error("💥 뉴스 기사 분석 중 에러 발생 (제목: {}): {}", item.getTitle(), e.getMessage(), e);
            }
        }
    }

    /**
     * 영향 분석 완료된 소식을 단일 종목에 적재 및 실시간 SSE 전파 (1:1 단순화)
     */
    private void processAndSave(String sourceTicker, String docUrl, StreamResponseDto responseDto) {
        String targetTicker = null;

        // AI가 분석한 연관 티커 목록 중 첫 번째 것을 사용하거나, 없을 경우 원본 소스 티커 사용
        if (responseDto.getImpactedTickers() != null && !responseDto.getImpactedTickers().isEmpty()) {
            targetTicker = responseDto.getImpactedTickers().get(0).trim().toUpperCase();
        } else if (sourceTicker != null) {
            targetTicker = sourceTicker.trim().toUpperCase();
        }

        if (targetTicker == null) {
            return;
        }

        // DB에 등록된 정상 종목인지 교차 검증
        if (stockRepository.findByTicker(targetTicker).isEmpty()) {
            log.warn("⚠️ [티커 검증 거부] AI가 리턴한 종목 '{}'가 DB Stock 테이블에 존재하지 않아 적재를 스킵합니다.", targetTicker);
            return;
        }

        String briefingJoined = String.join("||", responseDto.getBriefing());

        // 해당 종목 기준 중복 적재 방지
        boolean existsForTarget = eventRepository.existsByBaseTickerAndNewsUrlAndEventType(
                targetTicker, docUrl, "REALTIME_IMPACT"
        );

        if (!existsForTarget) {
            StockSupplyChainEvent newEvent = StockSupplyChainEvent.builder()
                    .baseTicker(targetTicker)
                    .eventName(responseDto.getTitle())
                    .eventDate(responseDto.getDate())
                    .estimatedImpact(briefingJoined)
                    .eventType("REALTIME_IMPACT")
                    .score(responseDto.getScore())
                    .newsUrl(docUrl)
                    .build();

            eventRepository.save(newEvent);
            log.info("💾 [속보 단일 적재 완료] 전파 대상: {}, 제목: {}", targetTicker, responseDto.getTitle());

            // 해당 종목의 SSE 스트림으로 속보 즉시 푸시
            streamService.pushEvent(targetTicker, "realtime-impact", responseDto);
        }
    }
}
