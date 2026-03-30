package com.wafercell.stock.service;

import com.wafercell.stock.client.KoreaInvestRealtimeClient;
import com.wafercell.stock.client.StockClient;
import com.wafercell.stock.dto.*;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final StockClient stockClient;
    private final KoreaInvestRealtimeClient realtimeClient;
    
    private final Map<String, StockDetailDto> stockCache = new ConcurrentHashMap<>();
    
    // 과거 데이터 저장소 (RSI용 종가, 거래대금 강도용 거래대금)
    private final Map<String, List<Double>> historicalPrices = new ConcurrentHashMap<>();
    private final Map<String, List<Double>> historicalTradingValues = new ConcurrentHashMap<>();

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        refreshAllStockData();
    }

    /**
     * DB에 등록된 모든 종목을 웹소켓 서버에 구독 요청합니다.
     */
    public void subscribeAllStocks() {
        log.info("모든 종목 실시간 구독 시작...");
        List<Stock> allStocks = stockRepository.findAll();
        for (Stock stock : allStocks) {
            realtimeClient.subscribe(stock.getExchange(), stock.getTicker());
        }
    }

    @Scheduled(cron = "0 0 * * * *")
    public void refreshAllStockData() {
        log.info("주가 및 20일 데이터 최신화 시작...");
        List<Stock> allStocks = stockRepository.findAll();
        
        if (allStocks.isEmpty()) {
            log.warn("DB에 등록된 종목이 없습니다.");
            return;
        }

        for (Stock stock : allStocks) {
            try {
                // 1. 현재 상세 데이터 로드 (시총 등)
                StockDetailDto node = fetchStockNodeFromApi(stock);
                
                // 2. 과거 20일 데이터 로드 (RSI 및 거래대금 평균용)
                loadHistoricalData(stock);
                
                // 3. 지표 초기 계산 및 세팅
                double rsi = calculateRSI(stock.getTicker(), node.getPrice());
                double avgTamt = calculateAverageTradingValue(stock.getTicker());
                double tamtRatio = avgTamt == 0 ? 0 : (node.getTradingValue() / avgTamt) * 100;

                node.setRsi(rsi);
                node.setAverageTradingValue(avgTamt);
                node.setTradingValueRatio(tamtRatio);
                
                stockCache.put(stock.getTicker(), node);
                
                stock.updateMarketCap(node.getMarketCap());
                stockRepository.save(stock);
                
                log.debug("데이터 로드 완료: {} (RSI: {}, 거래강도: {}%)", stock.getTicker(), String.format("%.2f", rsi), String.format("%.1f", tamtRatio));
                Thread.sleep(100); 
            } catch (Exception e) {
                log.error("데이터 로드 실패: {} - {}", stock.getTicker(), e.getMessage());
                double lastVal = stock.getMarketCap() != null ? stock.getMarketCap() : 100.0;
                stockCache.putIfAbsent(stock.getTicker(), StockDetailDto.builder()
                        .name(stock.getName())
                        .ticker(stock.getTicker())
                        .sector(stock.getSector())
                        .marketCap(lastVal)
                        .changePercent(0.0)
                        .rsi(50.0)
                        .build());
            }
        }
        log.info("주가 데이터 최신화 완료 (총 {}종목)", stockCache.size());
        
        // 데이터 로드 후 웹소켓 구독 수행
        subscribeAllStocks();
    }

    public void updateStockCache(StockUpdate update) {
        String ticker = update.getTicker();
        StockDetailDto existing = stockCache.get(ticker);
        if (existing != null) {
            try {
                double newPrice = Double.parseDouble(update.getPrice());
                double newRate = Double.parseDouble(update.getRate());
                long newVolume = (long) Double.parseDouble(update.getVolume());
                double newTradingValue = update.getTradingValue() != null ? Double.parseDouble(update.getTradingValue()) : 0.0;
                
                // RSI 및 거래강도 실시간 재계산
                double newRsi = calculateRSI(ticker, newPrice);
                double avgTamt = existing.getAverageTradingValue() != null ? existing.getAverageTradingValue() : 0.0;
                double newTamtRatio = avgTamt == 0 ? 0 : (newTradingValue / avgTamt) * 100;

                existing.setPrice(newPrice);
                existing.setChangePercent(newRate);
                existing.setVolume(newVolume);
                existing.setHighPrice(Double.parseDouble(update.getHighPrice()));
                existing.setLowPrice(Double.parseDouble(update.getLowPrice()));
                existing.setTradingValue(newTradingValue);
                existing.setStrength(Double.parseDouble(update.getStrength()));
                existing.setRsi(newRsi);
                existing.setTradingValueRatio(newTamtRatio);
                
                update.setRsi(String.format("%.2f", newRsi));
                stockCache.put(ticker, existing);
            } catch (Exception e) {
                log.error("캐시 업데이트 오류: {}", e.getMessage());
            }
        }
    }

    /**
     * 전체 및 섹터별 요약 정보와 종목 리스트를 포함한 히트맵 응답 데이터를 생성합니다.
     */
    public StockHeatmapResponse getFullHeatmapResponse() {
        List<StockDetailDto> allStocks = getAllStocks();

        // SOXX 종목 데이터 찾기 (비교용)
        double soxxRate = allStocks.stream()
                .filter(s -> "SOXX".equals(s.getTicker()))
                .mapToDouble(StockDetailDto::getChangePercent)
                .findFirst()
                .orElse(0.0);

        // 모든 종목에 SOXX 대비 상대 변동률 계산
        allStocks.forEach(s -> s.setRelativeChange(s.getChangePercent() - soxxRate));

        // 1. 섹터별 요약 정보 계산
        Map<String, List<StockDetailDto>> groupedBySector = allStocks.stream()
                .collect(Collectors.groupingBy(StockDetailDto::getSector));

        List<StockSummaryDto> sectorSummaries = groupedBySector.entrySet().stream()
                .map(entry -> {
                    String sectorName = entry.getKey();
                    List<StockDetailDto> sectorStocks = entry.getValue();

                    double totalMarketCap = sectorStocks.stream().mapToDouble(StockDetailDto::getMarketCap).sum();
                    long totalVolume = sectorStocks.stream().mapToLong(n -> n.getVolume() != null ? n.getVolume() : 0).sum();

                    // 시가총액 가중 평균 등락률 계산
                    double weightedAvgRate = totalMarketCap == 0 ? 0 :
                            sectorStocks.stream()
                                    .mapToDouble(n -> n.getChangePercent() * (n.getMarketCap() / totalMarketCap))
                                    .sum();

                    return StockSummaryDto.builder()
                            .name(sectorName)
                            .marketCap(totalMarketCap)
                            .changePercent(weightedAvgRate)
                            .volume(totalVolume)
                            .build();
                }).collect(Collectors.toList());

        // 2. 전체 요약 정보 계산
        double overallMarketCap = sectorSummaries.stream().mapToDouble(StockSummaryDto::getMarketCap).sum();
        long overallVolume = sectorSummaries.stream().mapToLong(StockSummaryDto::getVolume).sum();
        double overallChangeRate = overallMarketCap == 0 ? 0 :
                sectorSummaries.stream()
                        .mapToDouble(s -> s.getChangePercent() * (s.getMarketCap() / overallMarketCap))
                        .sum();

        StockSummaryDto overallSummary = StockSummaryDto.builder()
                .name("반도체 전체")
                .marketCap(overallMarketCap)
                .changePercent(overallChangeRate)
                .volume(overallVolume)
                .build();

        // 3. 최종 응답 객체 조립
        return StockHeatmapResponse.builder()
                .overall(overallSummary)
                .sectors(sectorSummaries)
                .stocks(allStocks)
                .build();
    }

    /**
     * 최신 해외 속보 목록을 가져와서 우리 반도체 종목과 연관된 뉴스만 필터링합니다.
     */
    public List<StockNewsDto> getLatestNews(String lastSrno) {
        try {
            Map<String, Object> response = stockClient.getOverseasBreakingNews(lastSrno);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> output = (List<Map<String, Object>>) response.get("output");

            if (output == null) return new ArrayList<>();

            return output.stream().map(item -> {
                List<String> tickers = new ArrayList<>();
                for (int i = 1; i <= 10; i++) {
                    String iscdKey = "iscd" + i;
                    if (item.containsKey(iscdKey) && item.get(iscdKey) != null && !item.get(iscdKey).toString().trim().isEmpty()) {
                        tickers.add(item.get(iscdKey).toString().trim());
                    }
                }

                return StockNewsDto.builder()
                        .id(item.get("cntt_usiq_srno").toString())
                        .newsOferEntpCode(item.get("news_ofer_entp_code").toString())
                        .date(item.get("data_dt").toString())
                        .time(item.get("data_tm").toString())
                        .title(item.get("hts_pbnt_titl_cntt").toString())
                        .source(item.get("dorg").toString())
                        .tickers(tickers)
                        .build();
            })
            .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("뉴스 조회 실패: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * 캐시된 모든 종목 데이터를 리스트 형태로 반환합니다. (평면 구조)
     */
    public List<StockDetailDto> getAllStocks() {
        return stockCache.values().stream()
                .collect(Collectors.toList());
    }

    /**
     * 현재 등록된 모든 섹터 목록을 반환합니다.
     */
    public List<String> getAllSectors() {
        return stockRepository.findAll().stream()
                .map(Stock::getSector)
                .distinct()
                .collect(Collectors.toList());
    }

    private void loadHistoricalData(Stock stock) {
        try {
            Map<String, Object> response = stockClient.getDailyPrice(stock.getExchange(), stock.getTicker());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> output2 = (List<Map<String, Object>>) response.get("output2");
            
            if (output2 != null && !output2.isEmpty()) {
                List<Map<String, Object>> last20Days = output2.stream().limit(20).collect(Collectors.toList());
                List<Double> closes = last20Days.stream().map(day -> Double.parseDouble(day.get("clos").toString())).collect(Collectors.toList());
                List<Double> tamts = last20Days.stream().map(day -> Double.parseDouble(day.get("tamt").toString())).collect(Collectors.toList());
                
                java.util.Collections.reverse(closes);
                java.util.Collections.reverse(tamts);
                
                historicalPrices.put(stock.getTicker(), closes);
                historicalTradingValues.put(stock.getTicker(), tamts);
            }
        } catch (Exception e) {
            log.warn("과거 데이터 로드 실패 ({}): {}", stock.getTicker(), e.getMessage());
        }
    }

    private double calculateAverageTradingValue(String ticker) {
        List<Double> tamts = historicalTradingValues.get(ticker);
        if (tamts == null || tamts.isEmpty()) return 0.0;
        return tamts.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    private double calculateRSI(String ticker, double currentPrice) {
        List<Double> prices = historicalPrices.get(ticker);
        if (prices == null || prices.size() < 14) return 50.0;

        int startIdx = Math.max(0, prices.size() - 13);
        List<Double> targetPrices = prices.subList(startIdx, prices.size());

        double au = 0.0, ad = 0.0;
        double prev = targetPrices.get(0);
        for (int i = 1; i < targetPrices.size(); i++) {
            double diff = targetPrices.get(i) - prev;
            if (diff > 0) au += diff; else ad += Math.abs(diff);
            prev = targetPrices.get(i);
        }
        
        double lastDiff = currentPrice - prev;
        if (lastDiff > 0) au += lastDiff; else ad += Math.abs(lastDiff);
        
        au /= 14.0; ad /= 14.0;
        if (ad == 0) return 100.0;
        return 100.0 - (100.0 / (1.0 + (au / ad)));
    }

    private StockDetailDto fetchStockNodeFromApi(Stock stock) {
        Map<String, Object> response = stockClient.getOverseasStockDetail(stock.getExchange(), stock.getTicker());
        @SuppressWarnings("unchecked")
        Map<String, Object> output = (Map<String, Object>) response.get("output");
        
        if (output == null) throw new RuntimeException("API 응답에 output 데이터가 없습니다.");

        double marketCap = parseDouble(output, "tomv");
        double last = parseDouble(output, "last");
        double high = parseDouble(output, "high");
        double low = parseDouble(output, "low");
        double base = parseDouble(output, "base");
        double rate = (base == 0) ? 0 : ((last - base) / base) * 100;
        long volume = (long) parseDouble(output, "tvol");
        double tamt = parseDouble(output, "tamt");

        stock.updateRealtimeInfo(last, rate, marketCap);
        
        return StockDetailDto.builder()
                .name(stock.getName()).ticker(stock.getTicker()).sector(stock.getSector())
                .marketCap(marketCap).changePercent(rate).price(last).highPrice(high).lowPrice(low)
                .prevClose(base).volume(volume).tradingValue(tamt).strength(0.0).build();
    }

    private double parseDouble(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return 0.0;
        try { return Double.parseDouble(val.toString().trim()); } catch (Exception e) { return 0.0; }
    }
}
