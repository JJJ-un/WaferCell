package com.wafercell.stock.service.application;

import com.wafercell.stock.client.SecEdgarClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OverseasInformationService {

    private final SecEdgarClient secEdgarClient;

    /**
     * 특정 URL에서 해당 기사의 본문 텍스트 1000자를 크롤링하여 가져옵니다.
     * RssItem 등 특정 외부 DTO에 의존하지 않는 독립 크롤러 로직입니다.
     */
    public String fetchArticleBody(String url) {
        if (url == null || url.trim().isEmpty()) {
            return "";
        }
        try {
            Document doc = Jsoup.connect(url.trim())
                    .userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                    .timeout(4000)
                    .get();

            String articleBody = doc.text();
            if (articleBody.length() > 1000) {
                articleBody = articleBody.substring(0, 1000);
            }
            return articleBody;
        } catch (Exception e) {
            log.warn("⚠️ 기사 본문 크롤링 실패 (주소: {}): {}", url, e.getMessage());
            return "";
        }
    }

    /**
     * 특정 종목의 최신 SEC EDGAR 공시 문서 URL을 가져옵니다.
     */
    public String getLatestFilingUrl(String ticker) {
        return secEdgarClient.getLatestFilingUrl(ticker);
    }

    /**
     * 특정 공시 HTML 주소에서 본문을 다운로드하고 태그를 정제하여 반환합니다.
     */
    public String fetchFilingTextByUrl(String docUrl) {
        return secEdgarClient.fetchFilingTextByUrl(docUrl);
    }

    /**
     * 특정 종목의 최신 SEC EDGAR 공시 원문 텍스트를 가져옵니다.
     */
    public String fetchLatestFilingText(String ticker) {
        return secEdgarClient.fetchLatestFilingText(ticker);
    }
}
