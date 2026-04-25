package com.wafercell.stock.service.application;
import com.wafercell.stock.dto.*;
import com.wafercell.stock.service.domain.StockAnalysisService;
import com.wafercell.stock.service.storage.StockDetailStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {
    private final StockDetailStore stockDetailStore;
    private final StockUpdateProcessor updateProcessor;
    private final StockAnalysisService analysisService;

    // 이게 여깄는게 맞나??
    public void updateStockCache(StockUpdate update) { updateProcessor.processUpdate(update); }
    // 처음 컨트롤러에서 바로 호출하는 메서드, 모든 정보를 저장한 캐시값을 인자로 넘겨준다. 
    public StockHeatmapResponse getFullHeatmapResponse() { return analysisService.generateMarketAnalysis(stockDetailStore.getAll()); }
}
