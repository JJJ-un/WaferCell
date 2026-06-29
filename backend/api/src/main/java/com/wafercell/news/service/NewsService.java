package com.wafercell.news.service;

import com.wafercell.news.dto.NewsDto;
import com.wafercell.news.entity.NewsItem;
import com.wafercell.news.repository.NewsItemRepository;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 일반 뉴스 피드 제공 서비스 레이어.
 * 기존의 동기식 포털 API 조회를 완전히 걷어내고, 백그라운드에서 주기적으로
 * 적재한 로컬 DB(NewsItem)로부터 초고속 페이징 조회를 수행합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsItemRepository newsItemRepository;
    private final StockRepository stockRepository;

    /**
     * 뉴스 목록을 로컬 DB로부터 페이징 조회합니다.
     * @param start 1-based 오프셋 (1, 16, 31 ...)
     */
    public List<NewsDto> getNews(int start) {
        try {
            log.info("📡 [NewsService] DB 뉴스 페이징 쿼리 실행 (start: {})", start);

            // Naver API 호환성 유지를 위해 1-based offset(1, 16, 31...)을 PageNumber로 환산 (size = 15)
            int pageNumber = Math.max(0, (start - 1) / 15);
            Pageable pageable = PageRequest.of(pageNumber, 15);

            Page<NewsItem> newsPage = newsItemRepository.findAllByOrderByCreatedAtDesc(pageable);

            return newsPage.getContent().stream().map(item -> 
                NewsDto.builder()
                        .id(item.getLinkHash())
                        .newsOferEntpCode("NAVER")
                        .date(item.getDate())
                        .time(item.getTime())
                        .title(item.getTitle())
                        .source(item.getSource())
                        .description(item.getDescription())
                        .tickers(Collections.emptyList())
                        .build()
            ).collect(Collectors.toList());

        } catch (Exception e) {
            log.error("💾 [NewsService] 로컬 DB 뉴스 조회 중 오류 발생: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * 특정 종목(ticker)에 해당하는 기사를 DB에서 LIKE 검색하여 반환합니다.
     * AI 분석 서비스 등에서 호출됩니다.
     */
    public List<NewsDto> getNewsByTicker(String ticker) {
        try {
            log.info("📡 [NewsService] 종목 상세 뉴스 DB LIKE 검색 실행 (ticker: {})", ticker);

            // 1. StockRepository에서 회사 한글명 조회 (예: NVDA -> 엔비디아)
            Stock stock = stockRepository.findByTicker(ticker).orElse(null);
            String keyword = (stock != null) ? stock.getName() : ticker;

            // 2. DB에서 키워드로 LIKE 검색 (최신 10개 추출)
            Pageable pageable = PageRequest.of(0, 10);
            Page<NewsItem> newsPage = newsItemRepository
                    .findByTitleContainingOrDescriptionContainingOrderByCreatedAtDesc(keyword, keyword, pageable);

            return newsPage.getContent().stream().map(item -> 
                NewsDto.builder()
                        .id(item.getLinkHash())
                        .newsOferEntpCode("NAVER")
                        .date(item.getDate())
                        .time(item.getTime())
                        .title(item.getTitle())
                        .source(item.getSource())
                        .description(item.getDescription())
                        .tickers(List.of(ticker))
                        .build()
            ).collect(Collectors.toList());

        } catch (Exception e) {
            log.error("💾 [NewsService] 종목 상세 뉴스 DB 검색 중 오류 발생: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}
