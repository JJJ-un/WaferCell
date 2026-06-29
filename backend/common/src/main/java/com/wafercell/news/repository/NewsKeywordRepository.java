package com.wafercell.news.repository;

import com.wafercell.news.entity.NewsKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NewsKeywordRepository extends JpaRepository<NewsKeyword, Long> {
    List<NewsKeyword> findAllByIsActiveTrue();
    boolean existsByKeyword(String keyword);
}
