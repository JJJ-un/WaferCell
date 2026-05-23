package com.wafercell.stock.service.application;

import com.wafercell.stock.dto.indicator.StockIndicators;
import com.wafercell.stock.dto.response.StockRealtimeResponse;
import com.wafercell.stock.dto.response.StockSnapshot;
import com.wafercell.stock.dto.response.StockUpdate;
import com.wafercell.stock.service.domain.StockIndicatorCalculator;
import com.wafercell.stock.service.storage.HistoricalPriceStore;
import com.wafercell.stock.service.storage.StockDetailStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 실시간 주가 업데이트 메시지를 받아 지표를 계산하고 캐시를 갱신합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StockUpdateProcessor {
    private final StockDetailStore stockDetailStore;
    private final HistoricalPriceStore historicalPriceStore;
    private final StockIndicatorCalculator calculator;

    public StockRealtimeResponse processUpdate(StockUpdate socketData) {
        if (socketData == null || socketData.getTicker() == null) return null;
        
        String ticker = socketData.getTicker();
        StockSnapshot snapshot = stockDetailStore.get(ticker);
        if (snapshot == null) return null;

        try {
            double newPrice = socketData.getPrice();
            double newTradingValue = socketData.getTradingValue() != null ? socketData.getTradingValue() : 0.0;
            
            // 1. 서버 전용 지표 계산 (RSI, 거래대금비율 등)
            double newRsi = calculator.calculateRSI(historicalPriceStore.get(ticker), newPrice);
            double avgTamt = (snapshot.getIndicators() != null && snapshot.getIndicators().getAverageTradingValue() != null) 
                    ? snapshot.getIndicators().getAverageTradingValue() : 0.0;
            double newTamtRatio = calculator.calculateTradingValueRatio(newTradingValue, avgTamt);

            // 2. 새로운 지표 객체 생성 (기존 지표 기반으로 확장)
            StockIndicators updatedIndicators = snapshot.getIndicators().toBuilder()
                    .rsi(newRsi)
                    .tradingValue(newTradingValue)
                    .tradingValueRatio(newTamtRatio)
                    .build();

            // 3. 전체 Snapshot 갱신 및 저장
            StockSnapshot updatedSnapshot = snapshot.updateFromSocket(socketData, updatedIndicators);
            stockDetailStore.update(ticker, updatedSnapshot);

            // 4. 프론트엔드 전송용 응답 조립 (필요한 정보만 추출)
            return StockRealtimeResponse.builder()
                    .ticker(ticker)
                    .price(updatedSnapshot.getPrice())
                    .indicators(updatedSnapshot.getIndicators())
                    .build();

        } catch (Exception e) {
            log.error("실시간 업데이트 처리 중 오류 발생 ({}): {}", ticker, e.getMessage(), e);
            return null;
        }
    }
}
