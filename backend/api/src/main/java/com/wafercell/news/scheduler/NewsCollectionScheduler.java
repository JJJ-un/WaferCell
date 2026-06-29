package com.wafercell.news.scheduler;

import com.wafercell.news.client.NaverNewsClient;
import com.wafercell.news.dto.NaverNewsRawResponse;
import com.wafercell.news.dto.NewsDto;
import com.wafercell.news.entity.NewsItem;
import com.wafercell.news.entity.NewsKeyword;
import com.wafercell.news.repository.NewsItemRepository;
import com.wafercell.news.repository.NewsKeywordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * 백그라운드에서 활성화된 키워드들을 읽어와 네이버 뉴스 API를 통해
 * 비동기 수집, DB 중복 방지 적재 및 STOMP 실시간 브로드캐스트를 수행하는 스케줄러 컴포넌트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NewsCollectionScheduler {

    private final NewsKeywordRepository newsKeywordRepository;
    private final NewsItemRepository newsItemRepository;
    private final NaverNewsClient naverNewsClient;
    private final SimpMessagingTemplate messagingTemplate;

    private static final DateTimeFormatter NAVER_PUBDATE_FORMATTER =
            DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss Z", Locale.ENGLISH);

    private static final DateTimeFormatter TARGET_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TARGET_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Scheduled(fixedRate = 30000) // 30초마다 수집 수행
    public void collectNews() {
        log.info("📡 [NewsCollectionScheduler] 백그라운드 뉴스 수집 작동 개시");

        List<NewsKeyword> activeKeywords = newsKeywordRepository.findAllByIsActiveTrue();
        if (activeKeywords.isEmpty()) {
            log.info("📡 [NewsCollectionScheduler] 활성화된 뉴스 검색 키워드가 존재하지 않습니다.");
            return;
        }

        for (NewsKeyword newsKeyword : activeKeywords) {
            String keyword = newsKeyword.getKeyword();
            log.info("📡 [NewsCollectionScheduler] 키워드 '{}' 수집 프로세스 가동", keyword);

            try {
                // 네이버 API를 통해 최신 뉴스 15개 쿼리
                NaverNewsRawResponse rawResponse = naverNewsClient.searchNews(keyword, 15, 1);
                if (rawResponse.getItems() == null || rawResponse.getItems().isEmpty()) {
                    continue;
                }

                for (NaverNewsRawResponse.NaverNewsItem item : rawResponse.getItems()) {
                    String link = item.getLink();
                    String linkHash = calculateMd5(link);

                    // DB 중복 여부 판단 (이미 적재된 기사라면 Skip)
                    if (newsItemRepository.existsByLinkHash(linkHash)) {
                        continue;
                    }

                    // HTML 태그 제거 및 텍스트 디코딩 정제
                    String cleanTitle = cleanHtml(item.getTitle());
                    String cleanDescription = cleanHtml(item.getDescription());
                    String sourceName = parseSource(item.getOriginallink());

                    // 날짜 파싱 및 yyyy-MM-dd / HH:mm 규격화
                    String formattedDate;
                    String formattedTime;
                    try {
                        ZonedDateTime zdt = ZonedDateTime.parse(item.getPubDate(), NAVER_PUBDATE_FORMATTER);
                        formattedDate = zdt.format(TARGET_DATE_FORMATTER);
                        formattedTime = zdt.format(TARGET_TIME_FORMATTER);
                    } catch (Exception parseEx) {
                        log.warn("📡 [NewsCollectionScheduler] pubDate 파싱 실패 (pubDate: {}): {}", item.getPubDate(), parseEx.getMessage());
                        ZonedDateTime now = ZonedDateTime.now();
                        formattedDate = now.format(TARGET_DATE_FORMATTER);
                        formattedTime = now.format(TARGET_TIME_FORMATTER);
                    }

                    // DB 엔티티 인서트
                    NewsItem newsItem = NewsItem.builder()
                            .linkHash(linkHash)
                            .title(cleanTitle)
                            .source(sourceName)
                            .date(formattedDate)
                            .time(formattedTime)
                            .link(link)
                            .description(cleanDescription)
                            .build();

                    newsItemRepository.save(newsItem);
                    log.info("💾 [NewsCollectionScheduler] 새 뉴스 DB 적재 완료: {}", cleanTitle);

                    // STOMP 웹소켓 브로드캐스트 전송
                    NewsDto newsDto = NewsDto.builder()
                            .id(linkHash)
                            .newsOferEntpCode("NAVER")
                            .date(formattedDate)
                            .time(formattedTime)
                            .title(cleanTitle)
                            .source(sourceName)
                            .description(cleanDescription)
                            .tickers(Collections.emptyList())
                            .build();

                    messagingTemplate.convertAndSend("/topic/stocks/news", newsDto);
                    log.info("📢 [NewsCollectionScheduler] STOMP 실시간 브로드캐스트 전송: {}", cleanTitle);
                }

            } catch (Exception e) {
                log.error("📡 [NewsCollectionScheduler] 키워드 '{}' 뉴스 수집 에러 발생: {}", keyword, e.getMessage(), e);
            }
        }

        log.info("📡 [NewsCollectionScheduler] 백그라운드 뉴스 수집 작동 완료");
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
            log.error("MD5 알고리즘 조회 실패", e);
            return String.valueOf(input.hashCode());
        }
    }

    private String cleanHtml(String text) {
        if (text == null) return "";
        return text.replaceAll("<[^>]*>", "")
                .replace("&quot;", "\"")
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&apos;", "'")
                .replace("`", "'")
                .trim();
    }

    private String parseSource(String originalLink) {
        if (originalLink == null || originalLink.isEmpty()) {
            return "네이버 뉴스";
        }
        try {
            java.net.URI uri = new java.net.URI(originalLink);
            String host = uri.getHost();
            if (host != null) {
                return host.startsWith("www.") ? host.substring(4) : host;
            }
            return "금융 기사";
        } catch (Exception e) {
            return "네이버 뉴스";
        }
    }
}
