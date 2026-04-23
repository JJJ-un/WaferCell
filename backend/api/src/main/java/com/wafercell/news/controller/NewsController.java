package com.wafercell.news.controller;

import com.wafercell.news.dto.NewsDto;
import com.wafercell.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 해외 주식 뉴스 제공을 위한 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    /**
     * 최신 해외 주식 속보 목록을 반환합니다. (무한 스크롤 지원)
     */
    @GetMapping
    public List<NewsDto> getNews(@RequestParam(required = false) String lastSrno) {
        return newsService.getLatestNews(lastSrno);
    }
}
