package com.wafercell.stock.client;

import com.wafercell.global.properties.KoreaInvestProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthClient {

    private final KoreaInvestProperties properties;
    private final RestClient restClient = RestClient.create();

    /**
     * [API용] 접근 토큰(Access Token) 발급
     * 한국투자증권 API 호출 시 헤더에 포함해야 합니다. (유효기간 24시간)
     */
    public String getAccessToken() {
        Map<String, String> body = Map.of(
                "grant_type", "client_credentials",
                "appkey", properties.getKey(),
                "appsecret", properties.getSecret()
        );

        Map response = restClient.post()
                .uri(properties.getUrl() + "/oauth2/tokenP")
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("access_token")) {
            log.error("Access Token 발급 실패: {}", response);
            throw new RuntimeException("한국투자증권 Access Token을 발급받을 수 없습니다.");
        }

        return (String) response.get("access_token");
    }

    /**
     * [웹소켓용] 실시간 접속 승인키(Approval Key) 발급
     * 실시간 주가 등락률 등을 받아올 때 사용합니다.
     */
    public String getApprovalKey() {
        Map<String, String> body = Map.of(
                "grant_type", "client_credentials",
                "appkey", properties.getKey(),
                "secretkey", properties.getSecret()
        );

        Map response = restClient.post()
                .uri(properties.getUrl() + "/oauth2/Approval")
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("approval_key")) {
            log.error("Approval Key 발급 실패: {}", response);
            throw new RuntimeException("한국투자증권 Approval Key를 발급받을 수 없습니다.");
        }

        return (String) response.get("approval_key");
    }
}
