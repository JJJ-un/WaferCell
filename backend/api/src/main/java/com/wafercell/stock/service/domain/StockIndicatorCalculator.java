package com.wafercell.stock.service.domain;

import com.wafercell.stock.dto.response.StockDetailDto;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class StockIndicatorCalculator {
    public double calculateRSI(List<Double> prices, double currentPrice) {
        if (prices == null || prices.size() < 14) return 50.0;
        int startIdx = Math.max(0, prices.size() - 14);
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
    public double calculateAverageTradingValue(List<Double> tamts) {
        if (tamts == null || tamts.isEmpty()) return 0.0;
        return tamts.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }
    public double calculateTradingValueRatio(double currentTamt, double avgTamt) {
        return avgTamt == 0 ? 0 : (currentTamt / avgTamt) * 100;
    }

    public double calculateWeightedAverageChange(double totalMarketCap, List<StockDetailDto> stocks) {
        if (totalMarketCap <= 0) return 0.0;
        return stocks.stream()
                .mapToDouble(s -> s.getChangePercent() * (s.getMarketCap() / totalMarketCap))
                .sum();
    }
}
