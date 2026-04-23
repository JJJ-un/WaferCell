package com.wafercell.stock.service.storage;

import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class HistoricalTradingValueStore {
    private final Map<String, List<Double>> historicalTradingValues = new ConcurrentHashMap<>();

    public void update(String ticker, List<Double> values) {
        historicalTradingValues.put(ticker, values);
    }

    public List<Double> get(String ticker) {
        return historicalTradingValues.get(ticker);
    }
}
