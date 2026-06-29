package com.wafercell.stock.client;

import com.wafercell.global.dto.KoreaInvestRawResponse;
import com.wafercell.global.properties.KoreaInvestProperties;
import com.wafercell.stock.dto.response.StockDailyPriceRaw;
import com.wafercell.stock.dto.response.StockMinutePriceRaw;
import com.wafercell.stock.dto.response.KisStockRaw;
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
    private static final String TR_OVERSEAS_MINUTE_PRICE = "HHDFS76950200";  

    // 한투 API 엔드포인트 경로 상수
    private static final String PATH_PRICE_DETAIL = "/uapi/overseas-price/v1/quotations/price-detail";
    private static final String PATH_DAILY_PRICE = "/uapi/overseas-price/v1/quotations/dailyprice";
    private static final String PATH_MINUTE_PRICE = "/uapi/overseas-price/v1/quotations/inquire-time-itemchartprice";

    /**
     * [해외주식] 종목 상세 시세 조회
     */
    public KoreaInvestRawResponse<KisStockRaw> getOverseasStockDetail(String exchangeCode, String ticker) {
        String uri = createUri(PATH_PRICE_DETAIL, Map.of(
            "AUTH", "",
            "EXCD", exchangeCode,
            "SYMB", ticker
        ));
        
        return fetch(uri, TR_OVERSEAS_STOCK_DETAIL, authClient.getAccessToken(), 
                     new ParameterizedTypeReference<KoreaInvestRawResponse<KisStockRaw>>() {});
    }

    /**
     * [해외주식] 기간별 시세 조회 (기본값: 일봉)
     */
    public KoreaInvestRawResponse<StockDailyPriceRaw> getDailyPrice(String exchangeCode, String ticker) {
        return getDailyPrice(exchangeCode, ticker, "0");
    }

    /**
     * [해외주식] 기간별 시세 조회 (조회구분 지정 가능)
     * gubn: "0"(일), "1"(주), "2"(월), "3"(년)
     */
    public KoreaInvestRawResponse<StockDailyPriceRaw> getDailyPrice(String exchangeCode, String ticker, String gubn) {
        String uri = createUri(PATH_DAILY_PRICE, Map.of(
            "AUTH", "",
            "EXCD", exchangeCode,
            "SYMB", ticker,
            "GUBN", gubn,
            "BYMD", "",
            "MODP", "1"
        ));

        return fetch(uri, TR_OVERSEAS_DAILY_PRICE, authClient.getAccessToken(), 
                     new ParameterizedTypeReference<KoreaInvestRawResponse<StockDailyPriceRaw>>() {});
    }

    /**
     * [해외주식] 당일 분봉 차트 조회
     * nmin: 분갭 ("1": 1분봉, "5": 5분봉 등)
     */
    public KoreaInvestRawResponse<StockMinutePriceRaw> getOverseasStockMinutes(String exchangeCode, String ticker, String nmin) {
        String uri = createUri(PATH_MINUTE_PRICE, Map.of(
            "AUTH", "",
            "EXCD", exchangeCode,
            "SYMB", ticker,
            "NMIN", nmin,
            "PINC", "1",
            "NEXT", "",
            "NREC", "120",
            "FILL", "",
            "KEYB", ""
        ));

        return fetch(uri, TR_OVERSEAS_MINUTE_PRICE, authClient.getAccessToken(), 
                     new ParameterizedTypeReference<KoreaInvestRawResponse<StockMinutePriceRaw>>() {});
    }
}
