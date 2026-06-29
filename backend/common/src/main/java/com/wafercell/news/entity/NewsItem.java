package com.wafercell.news.entity;

import com.wafercell.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 수집되어 적재된 뉴스 기사 정보를 저장하는 엔티티
 */
@Entity
@Getter
@Table(name = "news_items", indexes = {
        @Index(name = "idx_news_item_link_hash", columnList = "linkHash")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NewsItem extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String linkHash;    // 중복 수집 검증용 URL 해시값

    @Column(nullable = false, length = 500)
    private String title;       // 정제된 기사 제목

    @Column(length = 100)
    private String source;      // 언론사/출처

    @Column(nullable = false, length = 20)
    private String date;        // yyyy-MM-dd

    @Column(nullable = false, length = 10)
    private String time;        // HH:mm

    @Column(nullable = false, columnDefinition = "TEXT")
    private String link;        // 원본 기사 링크

    @Column(columnDefinition = "TEXT")
    private String description; // 정제된 기사 설명

    @Builder
    public NewsItem(String linkHash, String title, String source, String date, String time, String link, String description) {
        this.linkHash = linkHash;
        this.title = title;
        this.source = source;
        this.date = date;
        this.time = time;
        this.link = link;
        this.description = description;
    }
}
