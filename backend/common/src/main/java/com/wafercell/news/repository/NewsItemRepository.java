package com.wafercell.news.repository;

import com.wafercell.news.entity.NewsItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsItemRepository extends JpaRepository<NewsItem, Long> {
    boolean existsByLinkHash(String linkHash);
    Page<NewsItem> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // 종목별 상세 뉴스 조회를 위해 제목 또는 내용에 키워드가 포함된 기사 검색
    Page<NewsItem> findByTitleContainingOrDescriptionContainingOrderByCreatedAtDesc(String titleKeyword, String descKeyword, Pageable pageable);
}
