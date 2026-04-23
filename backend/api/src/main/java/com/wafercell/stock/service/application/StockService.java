package com.wafercell.stock.service.application;
import com.wafercell.stock.client.KoreaInvestRealtimeClient;
import com.wafercell.stock.dto.*;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.StockRepository;
import com.wafercell.stock.service.domain.StockAnalysisService;
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
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {
    private final StockRepository stockRepository;
    private final KoreaInvestRealtimeClient realtimeClient;
    private final StockDetailStore stockDetailStore;
    private final HistoricalPriceStore historicalPriceStore;
    private final HistoricalTradingValueStore historicalTradingValueStore;
    private final StockDataFetcher dataFetcher;
    private final StockMapper stockMapper;
    private final StockUpdateProcessor updateProcessor;
    private final StockAnalysisService analysisService;

    // 기본 주식 세팅 및 웹소켓 소환
    public void refreshAllStockData() {
        log.info("주식 데이터 최신화 프로세스 시작...");
        // 1. DB에서 모든 주식 정보 조회
        List<Stock> allStocks = stockRepository.findAll();
        for (Stock stock : allStocks) {
            try {
                // 2. 증권사 API에서 상세 정보 및 과거 데이터 조회
                StockApiResponse apiResponse = dataFetcher.fetchDetail(stock);
                Map<String, List<Double>> historicalData = dataFetcher.fetchHistoricalData(stock);

                historicalPriceStore.update(stock.getTicker(), historicalData.getOrDefault("prices", List.of()));
                historicalTradingValueStore.update(stock.getTicker(), historicalData.getOrDefault("tradingValues", List.of()));

                StockDetailDto node = stockMapper.toDetailDto(stock, apiResponse, 
                        historicalPriceStore.get(stock.getTicker()), 
                        historicalTradingValueStore.get(stock.getTicker()));

                stockDetailStore.update(stock.getTicker(), node);
                stock.updateMarketCap(node.getMarketCap());
                // 3. DB에 업데이트된 정보 저장
                stockRepository.save(stock);
                Thread.sleep(100);
            } catch (Exception e) {
                log.error("데이터 동기화 실패: {} - {}", stock.getTicker(), e.getMessage());
                stockDetailStore.update(stock.getTicker(), stockMapper.toFallbackDto(stock));
            }
        }
        log.info("모든 주식 데이터 최신화 완료");
        subscribeAllStocks();
    }

    public void updateStockCache(StockUpdate update) { updateProcessor.processUpdate(update); }
    // 처음 컨트롤러에서 바로 호출하는 메서드
    public StockHeatmapResponse getFullHeatmapResponse() { return analysisService.generateMarketAnalysis(stockDetailStore.getAll()); }
    public List<StockDetailDto> getAllStocks() { return stockDetailStore.getAll(); }
    public List<String> getAllSectors() { return stockRepository.findAll().stream().map(Stock::getSector).distinct().collect(Collectors.toList()); }
    public void subscribeAllStocks() { stockRepository.findAll().forEach(stock -> realtimeClient.subscribe(stock.getExchange(), stock.getTicker())); }
}
