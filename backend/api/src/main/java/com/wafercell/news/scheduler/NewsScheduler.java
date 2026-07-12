package com.wafercell.news.scheduler;

import com.wafercell.news.entity.News;
import com.wafercell.news.repository.NewsRepository;
import com.wafercell.stock.client.GoogleNewsRssClient;
import com.wafercell.stock.dto.RssItem;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
public class NewsScheduler {

    private final GoogleNewsRssClient googleNewsRssClient;
    private final StockRepository stockRepository;
    private final NewsRepository newsRepository;

    private static final DateTimeFormatter RSS_PUBDATE_FORMATTER =
            DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH);
    private static final DateTimeFormatter TARGET_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TARGET_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * 10분 주기로 뉴스 수집 (매 10분 마다 실행)
     */
    @Scheduled(cron = "0 */10 * * * *")
    public void collectNews() {
        log.info("⏰ [백그라운드 뉴스 수집 스케줄러] 기동 시작");

        // 1. 대시보드 메인 뉴스 수집 ("미국 증시 반도체", 15개)
        try {
            log.info("📡 [NewsScheduler] 대시보드 메인 시황 뉴스 수집 시도");
            List<RssItem> rssItems = googleNewsRssClient.fetchNewsRssKorean("미국 증시 반도체", 15);
            saveRssItems(rssItems, null);
        } catch (Exception e) {
            log.error("💥 [NewsScheduler] 대시보드 메인 뉴스 수집 실패: {}", e.getMessage(), e);
        }

        // 2. 종목 타겟 뉴스 수집
        List<Stock> stocks = stockRepository.findAll();
        for (Stock stock : stocks) {
            String ticker = stock.getTicker().trim().toUpperCase();
            try {
                log.info("📡 [NewsScheduler] 종목 '{}' 뉴스 수집 시도", ticker);
                String query = stock.getName() + " " + ticker;
                List<RssItem> rssItems = googleNewsRssClient.fetchNewsRssKorean(query, 5); // 종목당 5개 수집
                saveRssItems(rssItems, ticker);
            } catch (Exception e) {
                log.error("💥 [NewsScheduler] 종목 '{}' 뉴스 수집 실패: {}", ticker, e.getMessage(), e);
            }
        }

        log.info("⏰ [백그라운드 뉴스 수집 스케줄러] 기동 완료");
    }

    private void saveRssItems(List<RssItem> rssItems, String ticker) {
        for (RssItem item : rssItems) {
            String newsId = calculateMd5(item.getLink());
            
            // 중복 검사 후 신규 기사일 때만 저장
            if (!newsRepository.existsByNewsId(newsId)) {
                String formattedDate = "";
                String formattedTime = "";
                try {
                    ZonedDateTime zdt = ZonedDateTime.parse(item.getPubDate(), RSS_PUBDATE_FORMATTER);
                    formattedDate = zdt.format(TARGET_DATE_FORMATTER);
                    formattedTime = zdt.format(TARGET_TIME_FORMATTER);
                } catch (Exception e) {
                    ZonedDateTime now = ZonedDateTime.now();
                    formattedDate = now.format(TARGET_DATE_FORMATTER);
                    formattedTime = now.format(TARGET_TIME_FORMATTER);
                }

                News news = News.builder()
                        .newsId(newsId)
                        .newsOferEntpCode("GOOGLE_RSS")
                        .title(item.getTitle())
                        .source(item.getSource())
                        .description(item.getDescription())
                        .date(formattedDate)
                        .time(formattedTime)
                        .ticker(ticker)
                        .build();

                newsRepository.save(news);
                log.info("💾 [NewsScheduler] 신규 뉴스 저장 완료. Ticker: {}, ID: {}, Title: {}", 
                        (ticker == null) ? "GLOBAL" : ticker, newsId, news.getTitle());
            }
        }
    }

    private String calculateMd5(String input) {
        if (input == null) return "";
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : messageDigest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(input.hashCode());
        }
    }
}
