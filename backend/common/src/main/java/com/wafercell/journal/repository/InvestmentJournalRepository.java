package com.wafercell.journal.repository;

import com.wafercell.journal.entity.InvestmentJournal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

/**
 * InvestmentJournal 엔티티의 데이터베이스 쿼리를 처리하는 리포지토리
 */
@Repository
public interface InvestmentJournalRepository extends JpaRepository<InvestmentJournal, Long> {
    
    // 특정 종목의 일지 목록을 날짜 역순으로 조회
    List<InvestmentJournal> findByTickerOrderByJournalDateDesc(String ticker);
    
    // 전체 종목의 일지 목록을 날짜 역순으로 조회 (My Diary 페이지용)
    List<InvestmentJournal> findAllByOrderByJournalDateDesc();

    // 전체 종목의 일지 목록을 페이징 및 날짜 역순으로 조회
    Page<InvestmentJournal> findAllByOrderByJournalDateDesc(Pageable pageable);
}
