package com.wafercell.stock.service.domain;

import com.wafercell.stock.dto.response.StockSnapshot;
import com.wafercell.stock.dto.response.StockHeatmapResponse;
import com.wafercell.stock.dto.response.StockSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// 여기서 계산 히트맵으로 그리기 쉽게 전달해준다.
@Service
@RequiredArgsConstructor
public class StockAnalysisService {

    private final StockIndicatorCalculator calculator;
    private static final String BENCHMARK_TICKER = "SOXX";
    private static final String MARKET_TOTAL_NAME = "반도체 전체";

    public StockHeatmapResponse generateMarketAnalysis(List<StockSnapshot> allStocks) {
        // 1. 벤치마크 대비 상대 수익률 계산
        List<StockSnapshot> analyzedStocks = applyRelativeChange(allStocks);
        
        // 2. 섹터별 그룹화 및 요약
        Map<String, List<StockSnapshot>> groupedBySector = analyzedStocks.stream()
                .collect(Collectors.groupingBy(s -> s.getBase().getSector()));

        List<StockSummaryDto> sectorSummaries = groupedBySector.entrySet().stream()
                .map(entry -> calculateSectorSummary(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // 3. 시장 전체 요약
        StockSummaryDto overallSummary = calculateOverallSummary(sectorSummaries);

        return StockHeatmapResponse.builder()
                .overall(overallSummary)
                .sectors(sectorSummaries)
                .stocks(analyzedStocks)
                .build();
    }

    private List<StockSnapshot> applyRelativeChange(List<StockSnapshot> stocks) {
        double benchmarkRate = stocks.stream()
                .filter(s -> BENCHMARK_TICKER.equals(s.getBase().getTicker()))
                .mapToDouble(s -> s.getPrice().getChangePercent())
                .findFirst()
                .orElse(0.0);
    
        return stocks.stream()
                .map(s -> s.calculateRelativeChange(benchmarkRate))
                .collect(Collectors.toList());
    }

    private StockSummaryDto calculateSectorSummary(String sectorName, List<StockSnapshot> sectorStocks) {
        double totalMarketCap = sectorStocks.stream()
                .mapToDouble(s -> s.getBase().getMarketCap())
                .sum();
        
        double weightedAvgChange = calculator.calculateWeightedAverageChangeSnapshot(totalMarketCap, sectorStocks);

        return StockSummaryDto.builder()
                .name(sectorName)
                .marketCap(totalMarketCap)
                .changePercent(weightedAvgChange)
                .build();
    }

    private StockSummaryDto calculateOverallSummary(List<StockSummaryDto> sectorSummaries) {
        double overallMarketCap = sectorSummaries.stream().mapToDouble(StockSummaryDto::getMarketCap).sum();

        // 전체 요약의 경우 SummaryDto 리스트이므로 별도 계산 (필요시 Calculator에 오버로딩 가능)
        double overallChangeRate = overallMarketCap <= 0 ? 0 :
                sectorSummaries.stream()
                        .mapToDouble(s -> s.getChangePercent() * (s.getMarketCap() / overallMarketCap))
                        .sum();

        return StockSummaryDto.builder()
                .name(MARKET_TOTAL_NAME)
                .marketCap(overallMarketCap)
                .changePercent(overallChangeRate)
                .build();
    }
}
