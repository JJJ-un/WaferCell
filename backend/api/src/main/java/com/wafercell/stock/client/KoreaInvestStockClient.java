package com.wafercell.stock.client;

import com.wafercell.global.dto.KoreaInvestRawResponse;
import com.wafercell.global.properties.KoreaInvestProperties;
import com.wafercell.stock.dto.StockDailyPriceRaw;
import com.wafercell.stock.dto.StockDetailRaw;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 한국투자증권 해외 주식 시세 조회를 전담하는 클라이언트
 */
@Slf4j
@Component
public class KoreaInvestStockClient extends AbstractKoreaInvestClient {

    public KoreaInvestStockClient(KoreaInvestProperties properties, AuthClient authClient) {
        super(properties, authClient);
    }

    // 한투 API TR ID 상수
    private static final String TR_OVERSEAS_STOCK_DETAIL = "HHDFS76200200"; 
    private static final String TR_OVERSEAS_DAILY_PRICE = "HHDFS76240000";  

    // 한투 API 엔드포인트 경로 상수
    private static final String PATH_PRICE_DETAIL = "/uapi/overseas-price/v1/quotations/price-detail";
    private static final String PATH_DAILY_PRICE = "/uapi/overseas-price/v1/quotations/dailyprice";

    /**
     * [해외주식] 종목 상세 시세 조회
     */
    public KoreaInvestRawResponse<StockDetailRaw> getOverseasStockDetail(String exchangeCode, String ticker) {
        String uri = createUri(PATH_PRICE_DETAIL, Map.of(
            "AUTH", "",
            "EXCD", exchangeCode,
            "SYMB", ticker
        ));
        
        return fetch(uri, TR_OVERSEAS_STOCK_DETAIL, authClient.getAccessToken(), 
                     new ParameterizedTypeReference<KoreaInvestRawResponse<StockDetailRaw>>() {});
    }

    /**
     * [해외주식] 기간별 시세 조회
     */
    public KoreaInvestRawResponse<StockDailyPriceRaw> getDailyPrice(String exchangeCode, String ticker) {
        String uri = createUri(PATH_DAILY_PRICE, Map.of(
            "AUTH", "",
            "EXCD", exchangeCode,
            "SYMB", ticker,
            "GUBN", "0",
            "BYMD", "",
            "MODP", "1"
        ));

        return fetch(uri, TR_OVERSEAS_DAILY_PRICE, authClient.getAccessToken(), 
                     new ParameterizedTypeReference<KoreaInvestRawResponse<StockDailyPriceRaw>>() {});
    }
}
