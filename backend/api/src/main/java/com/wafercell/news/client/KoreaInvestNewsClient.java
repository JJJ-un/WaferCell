package com.wafercell.news.client;

import com.wafercell.global.dto.KoreaInvestRawResponse;
import com.wafercell.global.properties.KoreaInvestProperties;
import com.wafercell.news.dto.NewsRaw;
import com.wafercell.stock.client.AbstractKoreaInvestClient;
import com.wafercell.stock.client.AuthClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * 한국투자증권 뉴스 API 통신을 전담하는 클라이언트
 */
@Slf4j
@Component
public class KoreaInvestNewsClient extends AbstractKoreaInvestClient {

    public KoreaInvestNewsClient(KoreaInvestProperties properties, AuthClient authClient) {
        super(properties, authClient);
    }

    // 한투 API TR ID 상수
    private static final String TR_OVERSEAS_NEWS_TITLE = "FHKST01011801"; 

    // 한투 API 엔드포인트 경로 상수
    private static final String PATH_BREAKING_NEWS = "/uapi/overseas-price/v1/quotations/brknews-title";

    /**
     * [해외주식] 해외속보(제목) 조회 (무한 스크롤 지원)
     */
    public KoreaInvestRawResponse<List<NewsRaw>> getOverseasBreakingNews(String lastSrno) {
        String uri = createUri(PATH_BREAKING_NEWS, Map.of(
                "FID_NEWS_OFER_ENTP_CODE", "0",
                "FID_COND_MRKT_CLS_CODE", "",
                "FID_INPUT_ISCD", "",
                "FID_TITL_CNTT", "",
                "FID_INPUT_DATE_1", "",
                "FID_INPUT_HOUR_1", "",
                "FID_RANK_SORT_CLS_CODE", "",
                "FID_INPUT_SRNO", lastSrno != null ? lastSrno : "",
                "FID_COND_SCR_DIV_CODE", "11801"
        ));

        return fetch(uri, TR_OVERSEAS_NEWS_TITLE, authClient.getAccessToken(),
                new ParameterizedTypeReference<KoreaInvestRawResponse<List<NewsRaw>>>() {});
    }
}
