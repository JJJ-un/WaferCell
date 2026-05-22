package com.wafercell.stock.repository;

import com.wafercell.stock.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * Stock 엔티티를 위한 데이터 접근 리포지토리
 */
public interface StockRepository extends JpaRepository<Stock, Long> {

    /**
     * 특정 세부 섹터(예: 팹리스, 파운드리 등)에 속한 모든 종목을 조회합니다.
     * 히트맵 데이터를 구성할 때 사용됩니다.
     */
    List<Stock> findBySector(String sector);

    /**
     * 특정 티커(종목 코드)를 가진 종목을 조회합니다.
     */
    Optional<Stock> findByTicker(String ticker);
}
