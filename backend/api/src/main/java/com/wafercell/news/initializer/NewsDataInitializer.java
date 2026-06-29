package com.wafercell.news.initializer;

import com.wafercell.news.entity.NewsKeyword;
import com.wafercell.news.repository.NewsKeywordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 애플리케이션 시작 시 DB에 기본 수집 키워드("해외주식", "반도체", "경제시황")가 없는 경우 자동 생성하는 이니셜라이저
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class NewsDataInitializer implements CommandLineRunner {

    private final NewsKeywordRepository newsKeywordRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("🚀 [NewsDataInitializer] 뉴스 수집용 기본 키워드 시딩 체크 중...");

        List<String> defaultKeywords = List.of("해외주식", "반도체", "경제시황");

        for (String keyword : defaultKeywords) {
            if (!newsKeywordRepository.existsByKeyword(keyword)) {
                newsKeywordRepository.save(NewsKeyword.builder()
                        .keyword(keyword)
                        .isActive(true)
                        .build());
                log.info("➕ [NewsDataInitializer] 기본 뉴스 키워드 자동 등록: {}", keyword);
            }
        }

        log.info("🚀 [NewsDataInitializer] 뉴스 수집 기본 키워드 셋업 완료.");
    }
}
