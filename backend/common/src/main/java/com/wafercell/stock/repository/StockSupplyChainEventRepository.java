package com.wafercell.stock.repository;

import com.wafercell.stock.entity.StockSupplyChainEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockSupplyChainEventRepository extends JpaRepository<StockSupplyChainEvent, Long> {
    List<StockSupplyChainEvent> findByBaseTickerOrderByEventDateAsc(String baseTicker);
    List<StockSupplyChainEvent> findByBaseTickerAndEventDate(String baseTicker, String eventDate);
    boolean existsByBaseTickerAndEventNameAndEventType(String baseTicker, String eventName, String eventType);
    boolean existsByBaseTickerAndNewsUrlAndEventType(String baseTicker, String newsUrl, String eventType);
    boolean existsByNewsUrlAndEventType(String newsUrl, String eventType);
}
