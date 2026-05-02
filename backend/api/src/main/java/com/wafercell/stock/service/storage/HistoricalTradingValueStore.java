package com.wafercell.stock.service.storage;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class HistoricalTradingValueStore {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String REDIS_HASH_KEY = "HISTORICAL_TRADING_VALUE";

    public HistoricalTradingValueStore(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void update(String ticker, List<Double> values) {
        redisTemplate.opsForHash().put(REDIS_HASH_KEY, ticker, values);
    }

    @SuppressWarnings("unchecked")
    public List<Double> get(String ticker) {
        Object result = redisTemplate.opsForHash().get(REDIS_HASH_KEY, ticker);
        return result != null ? (List<Double>) result : null;
    }
}
