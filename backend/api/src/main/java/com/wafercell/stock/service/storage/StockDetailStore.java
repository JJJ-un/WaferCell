package com.wafercell.stock.service.storage;

import com.wafercell.stock.dto.response.StockDetailDto;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class StockDetailStore {

    private final RedisTemplate<String, Object> redisTemplate;
    // Redis에서 이 데이터를 묶어서 관리할 큰 주머니(Key) 이름입니다.
    private static final String REDIS_HASH_KEY = "STOCK_DETAIL";

    // 생성자 주입 (롬복 어노테이션이 없을 때 사용하는 표준 방식)
    public StockDetailStore(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void update(String ticker, StockDetailDto dto) {
        // 기존: stockCache.put(ticker, dto);
        // 변경: Redis Hash 구조에 'STOCK_DETAIL'이라는 키로 ticker(필드)와 dto(값)를 저장
        redisTemplate.opsForHash().put(REDIS_HASH_KEY, ticker, dto);
    }

    public StockDetailDto get(String ticker) {
        // 기존: return stockCache.get(ticker);
        // 변경: Redis에서 해당 ticker 정보를 찾아와서 StockDetailDto 타입으로 캐스팅
        Object result = redisTemplate.opsForHash().get(REDIS_HASH_KEY, ticker);
        return result != null ? (StockDetailDto) result : null;
    }

    public List<StockDetailDto> getAll() {
        // 기존: return List.copyOf(stockCache.values());
        // 변경: 'STOCK_DETAIL' 안에 있는 모든 값(values)을 리스트로 가져옴
        List<Object> values = redisTemplate.opsForHash().values(REDIS_HASH_KEY);
        return values.stream()
                .map(obj -> (StockDetailDto) obj)
                .collect(Collectors.toList());
    }
}
