package com.wafercell.news.service;

import com.wafercell.news.dto.NewsDto;
import com.wafercell.news.entity.News;
import com.wafercell.news.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 해외 주식 뉴스 제공 서비스 레이어.
 * 기존의 네이버 DB 캐싱 및 실시간 구글 RSS 호출 방식을 걷어내고, 
 * 백그라운드 스케줄러가 수집 및 저장한 DB의 뉴스 테이블 데이터를 페이징 조회하여 반환합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;

    /**
     * 메인 대시보드용 해외 금융/반도체 뉴스 조회 (DB 페이징 조회)
     */
    public List<NewsDto> getNews(int start) {
        try {
            // start는 1-based index (예: 1, 16, 31...)
            // 15개 단위 페이징을 위해 page 번호 환산: (start - 1) / 15
            int page = Math.max(0, (start - 1) / 15);
            log.info("📡 [NewsService] 메인 뉴스 DB 조회 - start: {}, page: {}", start, page);

            Page<News> newsPage = newsRepository.findByTickerIsNullOrderByDateDescTimeDesc(PageRequest.of(page, 15));
            return newsPage.getContent().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("💥 [NewsService] 메인 뉴스 조회 중 오류 발생: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * 특정 종목(ticker)에 해당하는 기사를 DB에서 조회하여 반환합니다. (최대 10개)
     */
    public List<NewsDto> getNewsByTicker(String ticker) {
        String upperTicker = ticker.trim().toUpperCase();
        try {
            log.info("📡 [NewsService] 종목 '{}' 뉴스 DB 조회", upperTicker);

            Page<News> newsPage = newsRepository.findByTickerOrderByDateDescTimeDesc(upperTicker, PageRequest.of(0, 10));
            return newsPage.getContent().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("💥 [NewsService] 종목 상세 뉴스 조회 중 오류 발생 (ticker: {}): {}", upperTicker, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    private NewsDto convertToDto(News news) {
        List<String> tickers = (news.getTicker() != null && !news.getTicker().isEmpty()) 
                ? List.of(news.getTicker()) 
                : Collections.emptyList();

        return NewsDto.builder()
                .id(news.getNewsId())
                .newsOferEntpCode(news.getNewsOferEntpCode())
                .date(news.getDate())
                .time(news.getTime())
                .title(news.getTitle())
                .source(news.getSource())
                .description(news.getDescription())
                .tickers(tickers)
                .build();
    }
}
