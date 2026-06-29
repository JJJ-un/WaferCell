package com.wafercell.stock.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class SecEdgarClient {

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 밸류체인 감시 대상 기업들의 공식 SEC CIK 식별자 코드 매핑
    private static final Map<String, String> CIK_MAP = new HashMap<>();
    static {
        CIK_MAP.put("AMD", "0000002488");
        CIK_MAP.put("NVDA", "0001045810");
        CIK_MAP.put("TSM", "0001046179");
        CIK_MAP.put("ASML", "0001060955");
        CIK_MAP.put("INTC", "0000050863");
        CIK_MAP.put("MU", "0000723125");
        CIK_MAP.put("AAPL", "0000320193");
    }

    /**
     * 특정 종목의 최신 공시 문서 URL을 가져옵니다. (본문 다운로드 없이 메타 JSON 데이터만 조회하므로 빠름)
     */
    public String getLatestFilingUrl(String ticker) {
        String upperTicker = ticker.trim().toUpperCase();
        String cik = CIK_MAP.get(upperTicker);
        if (cik == null) {
            log.warn("⚠️ [{}] 종목의 CIK 코드가 매핑되어 있지 않아 SEC 공시 URL 조회를 건너뜁니다.", upperTicker);
            return "";
        }

        try {
            // 1. SEC EDGAR 최근 제출 목록 메타 JSON 조회
            String url = String.format("https://data.sec.gov/submissions/CIK%s.json", cik);
            String jsonResponse = restClient.get()
                    .uri(url)
                    .header("User-Agent", "WaferCellAdmin Contact@wafercell.com") // SEC 권장 User-Agent 양식 필수 준수
                    .retrieve()
                    .body(String.class);

            if (jsonResponse == null || jsonResponse.isEmpty()) {
                return "";
            }

            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode recentNode = rootNode.path("filings").path("recent");
            if (recentNode.isMissingNode()) {
                return "";
            }

            JsonNode forms = recentNode.path("form");
            JsonNode accessionNumbers = recentNode.path("accessionNumber");
            JsonNode primaryDocuments = recentNode.path("primaryDocument");

            // 수시공시(8-K) 혹은 주요 재무공시(10-Q, 10-K) 중 가장 최근 1건 검색
            int targetIdx = -1;
            for (int i = 0; i < forms.size(); i++) {
                String form = forms.get(i).asText();
                if ("8-K".equals(form) || "10-Q".equals(form) || "10-K".equals(form)) {
                    targetIdx = i;
                    break;
                }
            }

            if (targetIdx == -1) {
                log.info("ℹ️ [{}] 종목의 최근 주요 수시공시(8-K) 내역이 없습니다.", upperTicker);
                return "";
            }

            String accNum = accessionNumbers.get(targetIdx).asText();
            String accNumNoDashes = accNum.replace("-", "");
            String primaryDoc = primaryDocuments.get(targetIdx).asText();

            // 2. 실제 공시 웹문서 HTML 주소 조립
            return String.format("https://www.sec.gov/Archives/edgar/data/%s/%s/%s", 
                    Long.parseLong(cik), accNumNoDashes, primaryDoc);

        } catch (Exception e) {
            log.error("💥 [{}] SEC 공시 URL 조회 중 치명적 에러 발생: {}", upperTicker, e.getMessage());
        }
        return "";
    }

    /**
     * 특정 공시 HTML 주소에서 본문을 다운로드하고 태그를 정제하여 상위 2000자를 반환합니다.
     */
    public String fetchFilingTextByUrl(String docUrl) {
        if (docUrl == null || docUrl.trim().isEmpty()) {
            return "";
        }
        try {
            log.info("📄 SEC 공시 다운로드 시도: {}", docUrl);
            String htmlContent = restClient.get()
                    .uri(docUrl.trim())
                    .header("User-Agent", "WaferCellAdmin Contact@wafercell.com")
                    .retrieve()
                    .body(String.class);

            if (htmlContent == null || htmlContent.isEmpty()) {
                return "";
            }

            // HTML 태그 걷어내고 순수 텍스트만 정제 추출
            String text = Jsoup.parse(htmlContent).text();
            
            // AI 요약 성능 및 컨텍스트 토큰 예산을 고려하여 상위 2000자만 발췌해 리턴합니다.
            return String.format("[공시원문 발췌]\n%s", 
                    text.substring(0, Math.min(text.length(), 2000)));

        } catch (Exception e) {
            log.error("💥 SEC 공시 다운로드 및 크롤링 중 치명적 에러 발생 (주소: {}): {}", docUrl, e.getMessage());
        }
        return "";
    }

    /**
     * 특정 종목의 가장 최신 공시 문서(8-K, 10-Q 등) 본문 전체를 긁어와 순수 텍스트로 반환합니다.
     */
    public String fetchLatestFilingText(String ticker) {
        String docUrl = getLatestFilingUrl(ticker);
        if (docUrl == null || docUrl.isEmpty()) {
            return "";
        }
        return fetchFilingTextByUrl(docUrl);
    }
}
