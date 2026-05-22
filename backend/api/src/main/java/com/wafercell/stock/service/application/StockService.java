package com.wafercell.stock.service.application;

import com.wafercell.stock.dto.response.StockHeatmapResponse;
import com.wafercell.stock.dto.response.StockRealtimeResponse;
import com.wafercell.stock.dto.response.StockUpdate;
import com.wafercell.stock.service.domain.StockAnalysisService;
import com.wafercell.stock.service.storage.StockDetailStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
}
