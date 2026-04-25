package com.wafercell.stock.service.application;

import com.wafercell.stock.client.KoreaInvestRealtimeClient;
import com.wafercell.stock.dto.StockApiResponse;
import com.wafercell.stock.dto.StockDetailDto;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.StockRepository;
import com.wafercell.stock.service.domain.StockMapper;
import com.wafercell.stock.service.infrastructure.StockDataFetcher;
import com.wafercell.stock.service.storage.HistoricalPriceStore;
import com.wafercell.stock.service.storage.HistoricalTradingValueStore;
import com.wafercell.stock.service.storage.StockDetailStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockDataSyncService {
    private final StockRepository stockRepository;
    private final KoreaInvestRealtimeClient realtimeClient;
    private final StockDetailStore stockDetailStore;
    private final HistoricalPriceStore historicalPriceStore;
    private final HistoricalTradingValueStore historicalTradingValueStore;
    private final StockDataFetcher dataFetcher;
    private final StockMapper stockMapper;

    public void refreshAllStockData() {
        log.info("주식 데이터 최신화 프로세스 시작...");
        // 1. DB에서 모든 주식 정보 조회
        List<Stock> allStocks = stockRepository.findAll();

        // 2. 각 주식에 대해 증권사 API에서 상세 정보와 과거 데이터 가져오기
        for (Stock stock : allStocks) {
            try {
                // 2. 증권사 API에서 상세 정보 가져오기
                StockApiResponse stockApiResponse = dataFetcher.fetchDetail(stock);
                // 3. 과거 20일간의 가격과 거래량 데이터 가져오기
                Map<String, List<Double>> historicalData = dataFetcher.fetchHistoricalData(stock);

                // 4. 과거 가격 데이터 스토어에 저장
                historicalPriceStore.update(stock.getTicker(), historicalData.getOrDefault("prices", List.of()));
                // 5. 과거 거래량 데이터 스토어에 저장
                historicalTradingValueStore.update(stock.getTicker(), historicalData.getOrDefault("tradingValues", List.of()));

                // 6. DB에서 가져온 기본 정보 + API에서 가져온 상세 정보 + 과거 데이터들을 조합하여 캐시에 저장할 DTO 생성
                StockDetailDto node = stockMapper.toDetailDto(stock, stockApiResponse, 
                        historicalPriceStore.get(stock.getTicker()), 
                        historicalTradingValueStore.get(stock.getTicker()));
                
                // 7. 캐시에 업데이트된 정보 저장
                stockDetailStore.update(stock.getTicker(), node);
                Thread.sleep(100);
            } catch (Exception e) {
                log.error("데이터 동기화 실패: {} - {}", stock.getTicker(), e.getMessage());
                stockDetailStore.update(stock.getTicker(), stockMapper.toFallbackDto(stock));
            }
        }
        log.info("모든 주식 데이터 최신화 완료");
        subscribeAllStocks();
    }

    public void subscribeAllStocks() {
        stockRepository.findAll().forEach(stock -> 
            realtimeClient.subscribe(stock.getExchange(), stock.getTicker()));
    }
}
