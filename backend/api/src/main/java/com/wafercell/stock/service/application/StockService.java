package com.wafercell.stock.service.application;

import com.wafercell.stock.dto.response.*;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.*;
import com.wafercell.stock.service.domain.StockAnalysisService;
import com.wafercell.stock.service.infrastructure.StockApiResponseParser;
import com.wafercell.stock.service.infrastructure.StockDataFetcher;
import com.wafercell.stock.service.storage.StockDetailStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 주식 관련 최상위 애플리케이션 서비스.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {
    private final StockDetailStore stockDetailStore;
    private final StockUpdateProcessor updateProcessor;
    private final StockAnalysisService analysisService;
    private final StockRepository stockRepository;
    private final StockDataFetcher dataFetcher;
    private final StockApiResponseParser parser;

    /**
     * 캐시를 업데이트하고 프론트엔드에 쏠 실시간 응답 객체를 반환합니다.
     */
    public StockRealtimeResponse updateStockCache(StockUpdate update) { 
        return updateProcessor.processUpdate(update); 
    }
    
    /**
     * 전체 히트맵 데이터를 가져옵니다.
     */
    public StockHeatmapResponse getFullHeatmapResponse() { 
        return analysisService.generateMarketAnalysis(stockDetailStore.getAll()); 
    }

    /**
     * 특정 종목의 일별 시세 목록을 조회합니다.
     */
    public List<StockDailyPriceResponse> getDailyPrices(String ticker) {
        Stock stock = stockRepository.findByTicker(ticker)
                .orElseThrow(() -> new RuntimeException("해당 종목을 찾을 수 없습니다: " + ticker));

        List<StockDailyPriceRaw> rawList = dataFetcher.fetchDailyPriceRawList(stock);

        return rawList.stream()
                .map(raw -> StockDailyPriceResponse.builder()
                        .date(formatDate(raw.getDate()))
                        .closePrice(parser.parseSafeDouble(raw.getClosePrice()))
                        .changeAmount(parser.parseSafeDouble(raw.getChangeAmount()))
                        .changeRate(parser.parseSafeDouble(raw.getChangeRate()))
                        .volume(parser.parseSafeLong(raw.getVolume()))
                        .tradingValue(parser.parseSafeDouble(raw.getTradingValue()))
                        .build())
                .collect(Collectors.toList());
    }

    private String formatDate(String rawDate) {
        if (rawDate == null || rawDate.length() != 8) return rawDate;
        return String.format("%s-%s-%s", 
                rawDate.substring(0, 4), 
                rawDate.substring(4, 6), 
                rawDate.substring(6, 8));
    }
}
