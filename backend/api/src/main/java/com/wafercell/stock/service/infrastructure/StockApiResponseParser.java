package com.wafercell.stock.service.infrastructure;

import com.wafercell.stock.dto.response.KisStockRaw;
import com.wafercell.stock.dto.response.StockPriceData;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
public class StockApiResponseParser {

    public StockPriceData parseDetail(KisStockRaw raw) {
        if (raw == null) throw new RuntimeException("API 응답 데이터가 없습니다.");

        double changeAmount = applySign(parseSafeDouble(raw.getChangeAmount()), raw.getSign());
        double changeRate = applySign(parseSafeDouble(raw.getChangeRate()), raw.getSign());

        return StockPriceData.builder()
                .marketCap(parseSafeDouble(raw.getMarketCap()))
                .lastPrice(parseSafeDouble(raw.getLastPrice()))
                .basePrice(parseSafeDouble(raw.getBasePrice()))
                .highPrice(parseSafeDouble(raw.getHighPrice()))
                .lowPrice(parseSafeDouble(raw.getLowPrice()))
                .changeAmount(changeAmount)
                .changeRate(changeRate)
                .volume(parseSafeLong(raw.getVolume()))
                .tradingValue(parseSafeDouble(raw.getTradingValue()))
                .strength(100.0)
                .build();
    }

    public double applySign(double value, String sign) {
        if (sign == null) return value;
        // 4: 하한, 5: 하락인 경우 마이너스 적용
        if (sign.equals("4") || sign.equals("5")) {
            return -Math.abs(value);
        }
        return Math.abs(value);
    }

    public double parseSafeDouble(String val) {
        return Optional.ofNullable(val)
                .map(s -> {
                    try {
                        String cleanVal = s.replace(",", "").trim();
                        return Double.parseDouble(cleanVal);
                    } catch (Exception e) { return 0.0; }
                })
                .orElse(0.0);
    }

    public long parseSafeLong(String val) {
        return Optional.ofNullable(val)
                .map(s -> {
                    try {
                        String cleanVal = s.replace(",", "").trim();
                        return Long.parseLong(cleanVal);
                    } catch (Exception e) { return 0L; }
                })
                .orElse(0L);
    }
}
