package com.wafercell.news.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "news", indexes = {
        @Index(name = "idx_news_ticker", columnList = "ticker"),
        @Index(name = "idx_news_id", columnList = "newsId", unique = true)
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String newsId;              // 기사 URL의 MD5 해시값 (중복 방지)

    @Column(nullable = false)
    private String newsOferEntpCode;    // 제공사 코드 (예: "GOOGLE_RSS")

    @Column(nullable = false)
    private String date;                // 날짜 ("yyyy-MM-dd")

    @Column(nullable = false)
    private String time;                // 시간 ("HH:mm")

    @Column(nullable = false, length = 1000)
    private String title;               // 기사 제목

    @Column(nullable = false)
    private String source;              // 언론사 출처

    @Column(length = 3000)
    private String description;         // 기사 요약본

    @Column(nullable = true)
    private String ticker;              // 대상 종목 티커 (null이면 메인 시황)

    @Column(nullable = true, length = 1000)
    private String link;                // 기사 원본 URL 링크

    @Builder
    public News(String newsId, String newsOferEntpCode, String date, String time, String title, String source, String description, String ticker, String link) {
        this.newsId = newsId;
        this.newsOferEntpCode = (newsOferEntpCode != null) ? newsOferEntpCode : "GOOGLE_RSS";
        this.date = date;
        this.time = time;
        this.title = title;
        this.source = source;
        this.description = description;
        this.ticker = ticker;
        this.link = link;
    }
}
