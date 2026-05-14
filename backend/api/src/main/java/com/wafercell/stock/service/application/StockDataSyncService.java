package com.wafercell.stock.service.application;

import com.wafercell.stock.dto.indicator.StockIndicators;
import com.wafercell.stock.dto.response.StockPriceData;
import com.wafercell.stock.dto.response.StockSnapshot;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.StockRepository;
import com.wafercell.stock.service.domain.StockMapper;
import com.wafercell.stock.service.domain.StockIndicatorCalculator;
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
    private final StockSubscriptionManager subscriptionManager;
    private final StockDetailStore stockDetailStore;
    private final HistoricalPriceStore historicalPriceStore;
    private final HistoricalTradingValueStore historicalTradingValueStore;
    private final StockDataFetcher dataFetcher;
    private final StockMapper stockMapper;
    private final StockIndicatorCalculator calculator;

    public void refreshAllStockData() {
        log.info("주식 데이터 최신화 프로세스 시작...");
        // 1. DB에서 모든 주식 정보 조회
        List<Stock> allStocks = stockRepository.findAll();

        // 2. 각 주식에 대해 증권사 API에서 상세 정보와 과거 데이터 가져오기
        for (Stock stock : allStocks) {
            String ticker = stock.getTicker();
            try {
                // 2. 증권사 API에서 상세 정보 가져오기
                StockPriceData stockPriceData = dataFetcher.fetchDetail(stock);
                // 3. 과거 20일간의 가격과 거래량 데이터 가져오기
                Map<String, List<Double>> historicalData = dataFetcher.fetchHistoricalData(stock);
                List<Double> prices = historicalData.getOrDefault("prices", List.of());
                List<Double> tradingValues = historicalData.getOrDefault("tradingValues", List.of());

                // 4. 과거 가격 데이터 스토어에 저장
                historicalPriceStore.update(ticker, prices);
                // 5. 과거 거래량 데이터 스토어에 저장
                historicalTradingValueStore.update(ticker, tradingValues);

                // 6. 지표 계산 및 캡슐화
                double rsi = calculator.calculateRSI(prices, stockPriceData.getLastPrice());
                double avgTamt = calculator.calculateAverageTradingValue(tradingValues);
                double tamtRatio = calculator.calculateTradingValueRatio(stockPriceData.getTradingValue(), avgTamt);

                StockIndicators indicators = StockIndicators.builder()
                        .rsi(rsi)
                        .averageTradingValue(avgTamt)
                        .tradingValueRatio(tamtRatio)
                        .build();

                // 7. DB에서 가져온 기본 정보 + API에서 가져온 상세 정보 + 계산된 지표를 조합하여 Snapshot 생성
                StockSnapshot node = stockMapper.toSnapshot(stock, stockPriceData, indicators);
                
                // 8. 캐시에 업데이트된 정보 저장
                stockDetailStore.update(ticker, node);
                Thread.sleep(100);
            } catch (Exception e) {
                log.error("데이터 동기화 실패: {} - {}", ticker, e.getMessage());
                stockDetailStore.update(ticker, stockMapper.toFallbackSnapshot(stock));
            }
        }
        log.info("모든 주식 데이터 최신화 완료");
        subscriptionManager.subscribeAllStocks(allStocks);
    }
}
