package com.wafercell.stock.service.storage;

import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class HistoricalPriceStore {
    private final Map<String, List<Double>> historicalPrices = new ConcurrentHashMap<>();

    public void update(String ticker, List<Double> prices) {
        historicalPrices.put(ticker, prices);
    }

    public List<Double> get(String ticker) {
        return historicalPrices.get(ticker);
    }
}
