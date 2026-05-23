package com.wafercell.stock.service.storage;

import com.wafercell.stock.dto.response.StockSnapshot;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class StockDetailStore {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String REDIS_HASH_KEY = "STOCK_SNAPSHOT";

    public StockDetailStore(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void update(String ticker, StockSnapshot snapshot) {
        redisTemplate.opsForHash().put(REDIS_HASH_KEY, ticker, snapshot);
    }

    public StockSnapshot get(String ticker) {
        Object result = redisTemplate.opsForHash().get(REDIS_HASH_KEY, ticker);
        return result != null ? (StockSnapshot) result : null;
    }

    public List<StockSnapshot> getAll() {
        List<Object> values = redisTemplate.opsForHash().values(REDIS_HASH_KEY);
        return values.stream()
                .map(obj -> (StockSnapshot) obj)
                .collect(Collectors.toList());
    }
}
