package com.wafercell.news.repository;

import com.wafercell.news.entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {

    boolean existsByNewsId(String newsId);

    Optional<News> findByNewsId(String newsId);

    // 메인 시황 뉴스 조회 (ticker가 null인 것만)
    Page<News> findByTickerIsNullOrderByDateDescTimeDesc(Pageable pageable);

    // 특정 종목 뉴스 조회
    Page<News> findByTickerOrderByDateDescTimeDesc(String ticker, Pageable pageable);
}
