package com.wafercell.stock.service.storage;

import com.wafercell.stock.dto.StockDetailDto;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class StockDetailStore {
    private final Map<String, StockDetailDto> stockCache = new ConcurrentHashMap<>();

    public void update(String ticker, StockDetailDto dto) {
        stockCache.put(ticker, dto);
    }

    public StockDetailDto get(String ticker) {
        return stockCache.get(ticker);
    }

    public List<StockDetailDto> getAll() {
        return List.copyOf(stockCache.values());
    }
}
