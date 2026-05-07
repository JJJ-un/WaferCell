package com.wafercell.stock.service.storage;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class HistoricalPriceStore {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String REDIS_HASH_KEY = "HISTORICAL_PRICE";

    public HistoricalPriceStore(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void update(String ticker, List<Double> prices) {
        redisTemplate.opsForHash().put(REDIS_HASH_KEY, ticker, prices);
    }

    @SuppressWarnings("unchecked")
    public List<Double> get(String ticker) {
        Object result = redisTemplate.opsForHash().get(REDIS_HASH_KEY, ticker);
        return result != null ? (List<Double>) result : null;
    }
}
