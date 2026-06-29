package com.wafercell.stock.repository;

import com.wafercell.stock.entity.StockSupplyChain;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockSupplyChainRepository extends JpaRepository<StockSupplyChain, Long> {
    List<StockSupplyChain> findByBaseTicker(String baseTicker);
}
