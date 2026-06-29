package com.wafercell.news.controller;

import com.wafercell.news.dto.NewsDto;
import com.wafercell.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 해외 주식 뉴스 제공을 위한 REST 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/stocks/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    /**
     * 해외 주식 뉴스 목록을 반환합니다. (대시보드 메인 시황 및 종목별 타겟 기사 2원화 지원)
     */
    @GetMapping
    public List<NewsDto> getNews(
            @RequestParam(defaultValue = "1") int start,
            @RequestParam(required = false) String ticker) {
        log.info("📡 [NewsController 수신] start: {}, ticker: {}", start, ticker);
        if (ticker != null && !ticker.trim().isEmpty()) {
            return newsService.getNewsByTicker(ticker);
        }
        return newsService.getNews(start);
    }

}
