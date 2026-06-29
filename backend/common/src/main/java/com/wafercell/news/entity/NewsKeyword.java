package com.wafercell.news.entity;

import com.wafercell.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 수집 대상 뉴스 검색 키워드를 관리하는 엔티티
 */
@Entity
@Getter
@Table(name = "news_keywords")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NewsKeyword extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String keyword;    // 뉴스 검색 키워드 (예: "해외주식", "반도체", "경제시황")

    @Column(nullable = false)
    private boolean isActive;  // 수집 활성화 여부

    @Builder
    public NewsKeyword(String keyword, boolean isActive) {
        this.keyword = keyword;
        this.isActive = isActive;
    }

    public void updateActive(boolean isActive) {
        this.isActive = isActive;
    }
}
