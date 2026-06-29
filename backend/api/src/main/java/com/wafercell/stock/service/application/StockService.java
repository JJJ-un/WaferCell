package com.wafercell.stock.service.application;

import com.wafercell.stock.dto.response.*;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.entity.StockSupplyChainEvent;
import com.wafercell.stock.repository.*;
import com.wafercell.stock.service.domain.StockAnalysisService;
import com.wafercell.stock.service.infrastructure.StockApiResponseParser;
import com.wafercell.stock.service.infrastructure.StockDataFetcher;
import com.wafercell.stock.service.storage.StockDetailStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
    private final StockSupplyChainEventRepository eventRepository;
    private final StockDataFetcher dataFetcher;
    private final StockApiResponseParser parser;

    /**
     * 특정 종목의 특정 날짜 속보 이벤트를 조회합니다.
     */
    public List<StockSupplyChainEvent> getEventsByDate(String ticker, String date) {
        return eventRepository.findByBaseTickerAndEventDate(ticker.trim().toUpperCase(), date);
    }

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
                .map(raw -> {
                    double changeAmount = parser.parseSafeDouble(raw.getChangeAmount());
                    double changeRate = parser.parseSafeDouble(raw.getChangeRate());
                    String sign = raw.getSign();

                    // 한투 API 규격상 하락/하한인 경우 마이너스 부호 강제 부여
                    if ("4".equals(sign) || "5".equals(sign)) {
                        changeAmount = -Math.abs(changeAmount);
                        changeRate = -Math.abs(changeRate);
                    } else if ("3".equals(sign)) {
                        changeAmount = 0.0;
                        changeRate = 0.0;
                    } else {
                        changeAmount = Math.abs(changeAmount);
                        changeRate = Math.abs(changeRate);
                    }

                    return StockDailyPriceResponse.builder()
                            .date(formatDate(raw.getDate()))
                            .closePrice(parser.parseSafeDouble(raw.getClosePrice()))
                            .changeAmount(changeAmount)
                            .changeRate(changeRate)
                            .volume(parser.parseSafeLong(raw.getVolume()))
                            .tradingValue(parser.parseSafeDouble(raw.getTradingValue()))
                            .build();
                })
                .collect(Collectors.toList());
    }

        /**
     * 특정 종목의 일별 시세를 안전하게 페이징하여 조회합니다. (메모리 기반 페이징)
     */
    public List<StockDailyPriceResponse> getDailyPricesPaged(String ticker, int page, int size) {
        List<StockDailyPriceResponse> allPrices = getDailyPrices(ticker);
        
        int fromIndex = page * size;
        if (fromIndex >= allPrices.size()) {
            return java.util.Collections.emptyList(); // 데이터 범위를 넘어가면 빈 리스트 반환
        }
        
        int toIndex = Math.min(fromIndex + size, allPrices.size());
        return allPrices.subList(fromIndex, toIndex); // 안전하게 구간 발췌
    }

    /**
     * 특정 종목의 차트 시계열 데이터를 조회하여 경량 DTO 포맷으로 반환합니다.
     * period: "일" | "주" | "월" | "년" | "1분" | "5분" 등
     */
    public List<StockChartPointResponse> getChartData(String ticker, String period) {
        Stock stock = stockRepository.findByTicker(ticker.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("해당 종목을 찾을 수 없습니다: " + ticker));

        // 1. 기간별 시세 (일, 주, 월)인 경우
        if (period.equals("일") || period.equals("주") || period.equals("월")) {
            String gubn = "0";
            if (period.equals("주")) gubn = "1";
            else if (period.equals("월")) gubn = "2";

            List<StockDailyPriceRaw> rawList = dataFetcher.fetchDailyPriceRawList(stock, gubn);

            return rawList.stream()
                    .map(raw -> {
                        String rawDate = raw.getDate();
                        long epochSec = 0L;
                        if (rawDate != null && rawDate.length() == 8) {
                            epochSec = LocalDate.of(
                                Integer.parseInt(rawDate.substring(0, 4)),
                                Integer.parseInt(rawDate.substring(4, 6)),
                                Integer.parseInt(rawDate.substring(6, 8))
                            ).atStartOfDay(ZoneOffset.UTC).toEpochSecond();
                        }
                        return StockChartPointResponse.builder()
                                .time(epochSec)
                                .value(parser.parseSafeDouble(raw.getClosePrice()))
                                .build();
                    })
                    .sorted(java.util.Comparator.comparing(p -> (Long) p.getTime()))
                    .collect(Collectors.toList());
        }

        // 2. 년봉(년)인 경우: 한투 API가 해외주식 연봉 조회를 지원하지 않으므로 월봉(GUBN=2)을 가공함
        if (period.equals("년")) {
            List<StockDailyPriceRaw> rawList = dataFetcher.fetchDailyPriceRawList(stock, "2");

            Map<String, List<StockDailyPriceRaw>> yearGroups = rawList.stream()
                    .filter(raw -> raw.getDate() != null && raw.getDate().length() == 8)
                    .collect(Collectors.groupingBy(raw -> raw.getDate().substring(0, 4)));

            return yearGroups.entrySet().stream()
                    .map(entry -> {
                        List<StockDailyPriceRaw> yearPrices = entry.getValue();
                        StockDailyPriceRaw lastRaw = yearPrices.stream()
                                .sorted(java.util.Comparator.comparing(StockDailyPriceRaw::getDate))
                                .reduce((first, second) -> second)
                                .orElse(null);

                        if (lastRaw == null) return null;

                        String rawDate = lastRaw.getDate();
                        long epochSec = LocalDate.of(
                            Integer.parseInt(rawDate.substring(0, 4)),
                            Integer.parseInt(rawDate.substring(4, 6)),
                            Integer.parseInt(rawDate.substring(6, 8))
                        ).atStartOfDay(ZoneOffset.UTC).toEpochSecond();

                        return StockChartPointResponse.builder()
                                .time(epochSec)
                                .value(parser.parseSafeDouble(lastRaw.getClosePrice()))
                                .build();
                    })
                    .filter(Objects::nonNull)
                    .sorted(java.util.Comparator.comparing(p -> (Long) p.getTime()))
                    .collect(Collectors.toList());
        }

        // 2. 분봉 (1분, 5분 등)인 경우
        String nmin = period.replace("분", "").trim();
        if (nmin.matches("\\d+")) {
            List<StockMinutePriceRaw> rawList = dataFetcher.fetchMinutePriceRawList(stock, nmin);

            return rawList.stream()
                    .map(raw -> {
                        String rawDate = raw.getLocalBaseDate(); // xymd
                        String rawTime = raw.getLocalBaseTime(); // xhms
                        long epochSec = 0L;
                        if (rawDate != null && rawDate.length() == 8 && rawTime != null && rawTime.length() == 6) {
                            epochSec = LocalDateTime.of(
                                Integer.parseInt(rawDate.substring(0, 4)),
                                Integer.parseInt(rawDate.substring(4, 6)),
                                Integer.parseInt(rawDate.substring(6, 8)),
                                Integer.parseInt(rawTime.substring(0, 2)),
                                Integer.parseInt(rawTime.substring(2, 4)),
                                Integer.parseInt(rawTime.substring(4, 6))
                            ).atZone(ZoneId.of("America/New_York")).toEpochSecond();
                        }
                        return StockChartPointResponse.builder()
                                .time(epochSec)
                                .value(parser.parseSafeDouble(raw.getClosePrice()))
                                .build();
                    })
                    .sorted(java.util.Comparator.comparing(p -> (Long) p.getTime()))
                    .collect(Collectors.toList());
        }

        throw new IllegalArgumentException("지원하지 않는 차트 주기입니다: " + period);
    }

    private String formatDate(String rawDate) {
        if (rawDate == null || rawDate.length() != 8) return rawDate;
        return String.format("%s-%s-%s", 
                rawDate.substring(0, 4), 
                rawDate.substring(4, 6), 
                rawDate.substring(6, 8));
    }
}
