package com.wafercell.stock.service.infrastructure;

import com.wafercell.stock.dto.response.StockApiResponse;
import com.wafercell.stock.entity.Stock;
import java.util.List;
import java.util.Map;

// 증권사 바뀌었을때를 대비하여 인터페이스로 추상화
public interface StockDataFetcher {
    StockApiResponse fetchDetail(Stock stock);
    Map<String, List<Double>> fetchHistoricalData(Stock stock);
}
