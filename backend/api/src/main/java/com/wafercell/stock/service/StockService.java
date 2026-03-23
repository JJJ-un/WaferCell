package com.wafercell.stock.service;

import com.wafercell.stock.client.StockClient;
import com.wafercell.stock.dto.HeatmapNode;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.StockRepository;
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
    private final StockClient stockClient;

    /**
     * 전체 히트맵 데이터를 생성합니다. (전체 -> 섹터 -> 하위섹터 -> 종목)
     */
    public HeatmapNode getTotalHeatmap() {
        List<Stock> allStocks = stockRepository.findAll();
        
        // 1. 대분류 섹터별로 그룹화
        Map<String, List<Stock>> sectors = allStocks.stream()
                .collect(Collectors.groupingBy(Stock::getSector));

        List<HeatmapNode> sectorNodes = sectors.entrySet().stream()
                .map(entry -> getSectorHeatmap(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // 전체 평균 등락률 및 총 시가총액 계산
        double totalValue = sectorNodes.stream().mapToDouble(HeatmapNode::getValue).sum();
        double avgRate = sectorNodes.stream().mapToDouble(n -> n.getRate() * (n.getValue() / totalValue)).sum();

        return HeatmapNode.builder()
                .name("전체")
                .value(totalValue)
                .rate(avgRate)
                .children(sectorNodes)
                .build();
    }

    /**
     * 특정 섹터 하위의 히트맵 데이터를 생성합니다. (섹터 -> 하위섹터 -> 종목)
     */
    public HeatmapNode getSectorHeatmap(String sectorName) {
        List<Stock> sectorStocks = stockRepository.findBySector(sectorName);
        return getSectorHeatmap(sectorName, sectorStocks);
    }

    /**
     * 내부 가공 로직: 종목 리스트를 계층형 노드로 변환
     */
    private HeatmapNode getSectorHeatmap(String sectorName, List<Stock> stocks) {
        // 1. 하위 섹터별로 그룹화 (팹리스, 파운드리 등)
        Map<String, List<Stock>> subSectors = stocks.stream()
                .collect(Collectors.groupingBy(Stock::getSubSector));

        List<HeatmapNode> subSectorNodes = subSectors.entrySet().stream()
                .map(entry -> {
                    List<HeatmapNode> stockNodes = entry.getValue().stream()
                            .map(this::fetchStockNode)
                            .collect(Collectors.toList());

                    double subTotalValue = stockNodes.stream().mapToDouble(HeatmapNode::getValue).sum();
                    double subAvgRate = stockNodes.stream()
                            .filter(n -> n.getValue() > 0)
                            .mapToDouble(n -> n.getRate() * (n.getValue() / subTotalValue))
                            .sum();

                    return HeatmapNode.builder()
                            .name(entry.getKey())
                            .value(subTotalValue)
                            .rate(subAvgRate)
                            .children(stockNodes)
                            .build();
                }).collect(Collectors.toList());

        double sectorTotalValue = subSectorNodes.stream().mapToDouble(HeatmapNode::getValue).sum();
        double sectorAvgRate = subSectorNodes.stream()
                .filter(n -> n.getValue() > 0)
                .mapToDouble(n -> n.getRate() * (n.getValue() / sectorTotalValue))
                .sum();

        return HeatmapNode.builder()
                .name(sectorName)
                .value(sectorTotalValue)
                .rate(sectorAvgRate)
                .children(subSectorNodes)
                .build();
    }

    /**
     * 한국투자증권 API로부터 실제 데이터를 가져와 단일 종목 노드를 생성합니다.
     */
    private HeatmapNode fetchStockNode(Stock stock) {
        try {
            Map<String, Object> response = stockClient.getOverseasStockPrice(stock.getExchange(), stock.getTicker());
            Map<String, Object> output = (Map<String, Object>) response.get("output");

            // 등락률(rate)과 시가총액(t_val) 추출 및 변환
            double rate = Double.parseDouble(output.get("rate").toString());
            double marketCap = Double.parseDouble(output.get("t_val").toString()); // 시가총액 단위: 백만달러

            return HeatmapNode.builder()
                    .name(stock.getTicker())
                    .value(marketCap)
                    .rate(rate)
                    .build();
        } catch (Exception e) {
            log.error("종목 데이터 조회 실패: {} - {}", stock.getTicker(), e.getMessage());
            return HeatmapNode.builder()
                    .name(stock.getTicker())
                    .value(0.0)
                    .rate(0.0)
                    .build();
        }
    }
}
