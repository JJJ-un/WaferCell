package com.wafercell.stock.service.infrastructure;

import com.wafercell.global.dto.KoreaInvestRawResponse;
import com.wafercell.stock.client.KoreaInvestStockClient;
import com.wafercell.stock.dto.response.StockDailyPriceRaw;
import com.wafercell.stock.dto.response.KisStockRaw;
import com.wafercell.stock.dto.response.StockPriceData;
import com.wafercell.stock.entity.Stock;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class KoreaInvestStockDataFetcher implements StockDataFetcher {
    private final KoreaInvestStockClient stockClient;
    private final StockApiResponseParser parser;

    @Override
    public StockPriceData fetchDetail(Stock stock) {
        KoreaInvestRawResponse<KisStockRaw> response = stockClient.getOverseasStockDetail(stock.getExchange(), stock.getTicker());
        return parser.parseDetail(response.getOutput());
    }

    @Override
    public Map<String, List<Double>> fetchHistoricalData(Stock stock) {
        KoreaInvestRawResponse<StockDailyPriceRaw> response = stockClient.getDailyPrice(stock.getExchange(), stock.getTicker());
        List<StockDailyPriceRaw> output2 = response.getOutput2();

        Map<String, List<Double>> result = new HashMap<>();
        if (output2 != null && !output2.isEmpty()) {
            List<StockDailyPriceRaw> last20Days = output2.stream().limit(20).collect(Collectors.toList());
            List<Double> closes = last20Days.stream().map(day -> parser.parseSafeDouble(day.getClosePrice())).collect(Collectors.toList());
            List<Double> tamts = last20Days.stream().map(day -> parser.parseSafeDouble(day.getTradingValue())).collect(Collectors.toList());
            List<Double> highs = last20Days.stream().map(day -> parser.parseSafeDouble(day.getHighPrice())).collect(Collectors.toList());
            List<Double> lows = last20Days.stream().map(day -> parser.parseSafeDouble(day.getLowPrice())).collect(Collectors.toList());
            List<Double> rates = last20Days.stream().map(day -> parser.parseSafeDouble(day.getChangeRate())).collect(Collectors.toList());

            Collections.reverse(closes);
            Collections.reverse(tamts);
            Collections.reverse(highs);
            Collections.reverse(lows);
            Collections.reverse(rates);

            result.put("prices", closes);
            result.put("tradingValues", tamts);
            result.put("highs", highs);
            result.put("lows", lows);
            result.put("rates", rates);
        }
        return result;
    }

    @Override
    public List<StockDailyPriceRaw> fetchDailyPriceRawList(Stock stock) {
        KoreaInvestRawResponse<StockDailyPriceRaw> response = stockClient.getDailyPrice(stock.getExchange(), stock.getTicker());
        return response.getOutput2() != null ? response.getOutput2() : Collections.emptyList();
    }
}
