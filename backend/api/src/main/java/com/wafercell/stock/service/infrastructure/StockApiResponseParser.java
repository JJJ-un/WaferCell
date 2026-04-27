package com.wafercell.stock.service.infrastructure;

import com.wafercell.stock.dto.response.StockDetailRaw;
import com.wafercell.stock.dto.response.StockApiResponse;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
public class StockApiResponseParser {

    public StockApiResponse parseDetail(StockDetailRaw raw) {
        if (raw == null) throw new RuntimeException("API 응답 데이터가 없습니다.");

        return StockApiResponse.builder()
                .marketCap(parseSafeDouble(raw.getMarketCap()))
                .lastPrice(parseSafeDouble(raw.getLastPrice()))
                .basePrice(parseSafeDouble(raw.getBasePrice()))
                .highPrice(parseSafeDouble(raw.getHighPrice()))
                .lowPrice(parseSafeDouble(raw.getLowPrice()))
                .changeAmount(parseSafeDouble(raw.getChangeAmount()))
                .changeRate(parseSafeDouble(raw.getChangeRate()))
                .volume(parseSafeLong(raw.getVolume()))
                .tradingValue(parseSafeDouble(raw.getTradingValue()))
                .build();
    }

    public double parseSafeDouble(String val) {
        return Optional.ofNullable(val)
                .map(s -> {
                    try { return Double.parseDouble(s.trim()); }
                    catch (Exception e) { return 0.0; }
                })
                .orElse(0.0);
    }

    public long parseSafeLong(String val) {
        return Optional.ofNullable(val)
                .map(s -> {
                    try { return Long.parseLong(s.trim()); }
                    catch (Exception e) { return 0L; }
                })
                .orElse(0L);
    }
}
